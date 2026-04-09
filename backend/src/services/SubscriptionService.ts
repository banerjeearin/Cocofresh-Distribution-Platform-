import { prisma } from '../server';

export class SubscriptionService {

  static async updateEndDate(subscriptionId: string, newEndDateStr: string) {
    const newEndDate = new Date(newEndDateStr);
    newEndDate.setHours(0, 0, 0, 0);

    // Fetch subscription with slots, holidays, and active plan
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        delivery_slots: {
          select: { id: true, scheduled_date: true, status: true }
        },
        holidays: {
          select: { id: true, date: true }
        },
        plans: {
          orderBy: { effective_from: 'desc' },
          take: 1,
        },
      }
    });

    if (!sub) throw new Error('Subscription not found');

    const currentEndDate = new Date(sub.end_date);
    currentEndDate.setHours(0, 0, 0, 0);

    // No-op if same date
    if (newEndDate.getTime() === currentEndDate.getTime()) {
      return { message: 'No change' };
    }

    const plan = sub.plans[0];

    // ── SHORTENING ────────────────────────────────────────────────────────────
    if (newEndDate < currentEndDate) {

      // Block if any DELIVERED slots exist beyond the new end date
      const blockedSlots = sub.delivery_slots.filter(s => {
        const d = new Date(s.scheduled_date);
        d.setHours(0, 0, 0, 0);
        return d > newEndDate && s.status === 'delivered';
      });

      if (blockedSlots.length > 0) {
        const dates = blockedSlots
          .map(s => new Date(s.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))
          .slice(0, 5)  // show max 5 dates
          .join(', ');
        const err = new Error(
          `Cannot shorten: ${blockedSlots.length} delivered slot(s) exist after ` +
          `${newEndDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ` +
          `(${dates}). Revert them to Pending first.`
        ) as any;
        err.statusCode = 422;
        throw err;
      }

      // Delete pending/skipped/holiday slots beyond new end date
      const slotIdsToDelete = sub.delivery_slots
        .filter(s => {
          const d = new Date(s.scheduled_date);
          d.setHours(0, 0, 0, 0);
          return d > newEndDate &&
            (s.status === 'pending' || s.status === 'skipped' || s.status === 'holiday');
        })
        .map(s => s.id);

      if (slotIdsToDelete.length > 0) {
        await prisma.deliverySlot.deleteMany({ where: { id: { in: slotIdsToDelete } } });
      }

      // Auto-delete holidays outside new date range
      const holidayIdsToDelete = sub.holidays
        .filter(h => {
          const d = new Date(h.date);
          d.setHours(0, 0, 0, 0);
          return d > newEndDate;
        })
        .map(h => h.id);

      if (holidayIdsToDelete.length > 0) {
        await prisma.customerHoliday.deleteMany({ where: { id: { in: holidayIdsToDelete } } });
      }
    }

    // ── EXTENDING ─────────────────────────────────────────────────────────────
    if (newEndDate > currentEndDate) {
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      // Build set of holiday dates to skip
      const holidayDates = new Set(
        sub.holidays.map(h => {
          const d = new Date(h.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      // Build set of existing slot dates to avoid duplicates
      const existingSlotTimes = new Set(
        sub.delivery_slots.map(s => {
          const d = new Date(s.scheduled_date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      // First new slot is day AFTER current end date
      const extensionStart = new Date(currentEndDate);
      extensionStart.setDate(extensionStart.getDate() + 1);

      const newSlots: any[] = [];
      const cursor = new Date(extensionStart);

      while (cursor <= newEndDate) {
        const slotDate = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 0, 0, 0, 0);
        const isPast = slotDate < todayMidnight;

        if (!holidayDates.has(slotDate.getTime()) && !existingSlotTimes.has(slotDate.getTime())) {
          newSlots.push({
            subscription_id:   sub.id,
            customer_id:       sub.customer_id,
            address_id:        sub.address_id,
            scheduled_date:    slotDate,
            actual_date:       isPast ? slotDate : null,
            status:            isPast ? 'delivered' : 'pending',
            qty_ordered:       plan?.qty_per_day ?? 1,
            qty_delivered:     isPast ? (plan?.qty_per_day ?? 1) : null,
            price_at_delivery: plan?.price_per_unit ?? null,
            grade_id:          plan?.grade_id ?? null,
            marked_by:         isPast ? 'system' : null,
            marked_at:         isPast ? slotDate : null,
          });
        }

        cursor.setDate(cursor.getDate() + 1);
      }

      if (newSlots.length > 0) {
        await prisma.deliverySlot.createMany({ data: newSlots, skipDuplicates: true });

        // Auto-create billing entries for any new past slots
        const pastNewSlots = newSlots.filter(s => s.status === 'delivered');
        if (pastNewSlots.length > 0) {
          const createdSlots = await prisma.deliverySlot.findMany({
            where: {
              subscription_id: sub.id,
              scheduled_date: { gte: extensionStart, lte: newEndDate },
              status: 'delivered',
            },
            select: { id: true, scheduled_date: true },
          });

          if (createdSlots.length > 0) {
            await prisma.billingEntry.createMany({
              data: createdSlots.map(s => ({
                delivery_slot_id: s.id,
                customer_id:      sub.customer_id,
                subscription_id:  sub.id,
                address_id:       sub.address_id,
                delivery_date:    s.scheduled_date,
                qty_delivered:    plan?.qty_per_day ?? 1,
                price_per_unit:   plan?.price_per_unit ?? 0,
                line_amount:      (plan?.qty_per_day ?? 1) * (plan?.price_per_unit ?? 0),
              })),
              skipDuplicates: true,
            });
          }
        }
      }
    }

    // ── Update end_date and recalculate total_days ────────────────────────────
    const startDate = new Date(sub.start_date);
    startDate.setHours(0, 0, 0, 0);
    const totalDays =
      Math.round((newEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data:  { end_date: newEndDate, total_days: totalDays },
    });

    return {
      message:    newEndDate > currentEndDate ? 'Subscription extended' : 'Subscription shortened',
      total_days: totalDays,
      new_end_date: newEndDate.toISOString(),
    };
  }
}
