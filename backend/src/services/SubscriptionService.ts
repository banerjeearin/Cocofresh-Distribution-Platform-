import { prisma } from '../server';

export class SubscriptionService {

  static async updateEndDate(subscriptionId: string, newEndDateStr: string) {
    const newEndDate = new Date(newEndDateStr);
    newEndDate.setHours(0, 0, 0, 0);

    // Fetch subscription with slots and holidays
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        delivery_slots: { select: { id: true, scheduled_date: true, status: true } },
        holidays:       { select: { id: true, date: true } },
        plans:          { orderBy: { effective_from: 'desc' }, take: 1, include: { grade: true } },
      }
    });

    if (!sub) throw new Error('Subscription not found');

    const currentEndDate = new Date(sub.end_date);
    currentEndDate.setHours(0, 0, 0, 0);

    // No-op if same date
    if (newEndDate.getTime() === currentEndDate.getTime()) {
      return { message: 'No change', subscription: sub };
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
          .join(', ');
        throw Object.assign(
          new Error(
            `Cannot shorten: ${blockedSlots.length} delivered slot(s) exist after ${newEndDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} (${dates}). ` +
            `Revert them to Pending first.`
          ),
          { statusCode: 422 }
        );
      }

      // Delete pending/skipped slots beyond new end date
      const slotIdsToDelete = sub.delivery_slots
        .filter(s => {
          const d = new Date(s.scheduled_date);
          d.setHours(0, 0, 0, 0);
          return d > newEndDate && (s.status === 'pending' || s.status === 'skipped');
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

      // Build set of existing holiday dates (to skip)
      const holidayDates = new Set(
        sub.holidays.map(h => {
          const d = new Date(h.date);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      );

      // Build set of existing slot dates (to avoid duplicates)
      const existingSlotDates = new Set(
        sub.delivery_slots.map(s => {
          const d = new Date(s.scheduled_date);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
      );

      // Generate new slots from day after current end to new end date
      const newSlots: any[] = [];
      const cursor = new Date(currentEndDate);
      cursor.setDate(cursor.getDate() + 1); // start from the day after

      while (cursor <= newEndDate) {
        const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;

        if (!holidayDates.has(key) && !existingSlotDates.has(key)) {
          const slotDate = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 0, 0, 0, 0);
          const isPast = slotDate < todayMidnight;

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
        await prisma.deliverySlot.createMany({ data: newSlots });

        // Create billing entries for any past slots in the extension
        const pastNewSlots = newSlots.filter(s => s.status === 'delivered');
        if (pastNewSlots.length > 0) {
          const createdSlots = await prisma.deliverySlot.findMany({
            where: {
              subscription_id: sub.id,
              scheduled_date: { gte: cursor },
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

    // ── Update subscription end_date and recalculate total_days ───────────────
    const startDate = new Date(sub.start_date);
    startDate.setHours(0, 0, 0, 0);
    const totalDays = Math.round((newEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data:  { end_date: newEndDate, total_days: totalDays },
    });

    return { message: 'End date updated', subscription: updated };
  }
}
