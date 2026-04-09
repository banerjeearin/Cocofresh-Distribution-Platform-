import { prisma } from '../server';

export class SubscriptionService {

  // ─── Update End Date ────────────────────────────────────────────────────────
  static async updateEndDate(subscriptionId: string, newEndDateStr: string) {
    const newEndDate = new Date(newEndDateStr);
    newEndDate.setHours(0, 0, 0, 0);

    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        delivery_slots: { select: { id: true, scheduled_date: true, status: true } },
        holidays:       { select: { id: true, date: true } },
        plans:          { orderBy: { effective_from: 'desc' }, take: 1 },
      }
    });

    if (!sub) throw new Error('Subscription not found');

    const currentEndDate = new Date(sub.end_date);
    currentEndDate.setHours(0, 0, 0, 0);

    if (newEndDate.getTime() === currentEndDate.getTime()) return { message: 'No change' };

    const plan = sub.plans[0];

    // SHORTENING
    if (newEndDate < currentEndDate) {
      const blockedSlots = sub.delivery_slots.filter(s => {
        const d = new Date(s.scheduled_date); d.setHours(0,0,0,0);
        return d > newEndDate && s.status === 'delivered';
      });

      if (blockedSlots.length > 0) {
        const dates = blockedSlots
          .map(s => new Date(s.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))
          .slice(0, 5).join(', ');
        const err = new Error(
          `Cannot shorten: ${blockedSlots.length} delivered slot(s) exist after ` +
          `${newEndDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ` +
          `(${dates}). Revert them to Pending first.`
        ) as any;
        err.statusCode = 422;
        throw err;
      }

      const slotIdsToDelete = sub.delivery_slots
        .filter(s => { const d = new Date(s.scheduled_date); d.setHours(0,0,0,0); return d > newEndDate; })
        .map(s => s.id);
      if (slotIdsToDelete.length > 0) {
        await prisma.deliverySlot.deleteMany({ where: { id: { in: slotIdsToDelete } } });
      }

      const holidayIdsToDelete = sub.holidays
        .filter(h => { const d = new Date(h.date); d.setHours(0,0,0,0); return d > newEndDate; })
        .map(h => h.id);
      if (holidayIdsToDelete.length > 0) {
        await prisma.customerHoliday.deleteMany({ where: { id: { in: holidayIdsToDelete } } });
      }
    }

    // EXTENDING
    if (newEndDate > currentEndDate) {
      const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0);

      const holidayTimes = new Set(sub.holidays.map(h => { const d = new Date(h.date); d.setHours(0,0,0,0); return d.getTime(); }));
      const existingTimes = new Set(sub.delivery_slots.map(s => { const d = new Date(s.scheduled_date); d.setHours(0,0,0,0); return d.getTime(); }));

      const extensionStart = new Date(currentEndDate);
      extensionStart.setDate(extensionStart.getDate() + 1);

      const newSlots: any[] = [];
      const cursor = new Date(extensionStart);
      while (cursor <= newEndDate) {
        const slotDate = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 0,0,0,0);
        const isPast = slotDate < todayMidnight;
        if (!holidayTimes.has(slotDate.getTime()) && !existingTimes.has(slotDate.getTime())) {
          newSlots.push({
            subscription_id:   sub.id, customer_id: sub.customer_id, address_id: sub.address_id,
            scheduled_date: slotDate, actual_date: isPast ? slotDate : null,
            status: isPast ? 'delivered' : 'pending',
            qty_ordered: plan?.qty_per_day ?? 1, qty_delivered: isPast ? (plan?.qty_per_day ?? 1) : null,
            price_at_delivery: plan?.price_per_unit ?? null, grade_id: plan?.grade_id ?? null,
            marked_by: isPast ? 'system' : null, marked_at: isPast ? slotDate : null,
          });
        }
        cursor.setDate(cursor.getDate() + 1);
      }

      if (newSlots.length > 0) {
        await prisma.deliverySlot.createMany({ data: newSlots, skipDuplicates: true });
        const pastNewSlots = newSlots.filter(s => s.status === 'delivered');
        if (pastNewSlots.length > 0) {
          const created = await prisma.deliverySlot.findMany({
            where: { subscription_id: sub.id, scheduled_date: { gte: extensionStart, lte: newEndDate }, status: 'delivered' },
            select: { id: true, scheduled_date: true },
          });
          if (created.length > 0) {
            await prisma.billingEntry.createMany({
              data: created.map(s => ({
                delivery_slot_id: s.id, customer_id: sub.customer_id,
                subscription_id: sub.id, address_id: sub.address_id,
                delivery_date: s.scheduled_date, qty_delivered: plan?.qty_per_day ?? 1,
                price_per_unit: plan?.price_per_unit ?? 0,
                line_amount: (plan?.qty_per_day ?? 1) * (plan?.price_per_unit ?? 0),
              })),
              skipDuplicates: true,
            });
          }
        }
      }
    }

    const startDate = new Date(sub.start_date); startDate.setHours(0,0,0,0);
    const totalDays = Math.round((newEndDate.getTime() - startDate.getTime()) / 86400000) + 1;
    await prisma.subscription.update({ where: { id: subscriptionId }, data: { end_date: newEndDate, total_days: totalDays } });

    return {
      message: newEndDate > currentEndDate ? 'Subscription extended' : 'Subscription shortened',
      total_days: totalDays,
      new_end_date: newEndDate.toISOString(),
    };
  }

  // ─── Update Start Date ──────────────────────────────────────────────────────
  static async updateStartDate(subscriptionId: string, newStartDateStr: string) {
    const newStartDate = new Date(newStartDateStr);
    newStartDate.setHours(0, 0, 0, 0);

    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        delivery_slots: { select: { id: true, scheduled_date: true, status: true } },
        holidays:       { select: { id: true, date: true } },
        plans:          { orderBy: { effective_from: 'desc' }, take: 1 },
      }
    });

    if (!sub) throw new Error('Subscription not found');

    const currentStartDate = new Date(sub.start_date);
    currentStartDate.setHours(0, 0, 0, 0);
    const endDate = new Date(sub.end_date);
    endDate.setHours(0, 0, 0, 0);

    if (newStartDate.getTime() === currentStartDate.getTime()) return { message: 'No change' };
    if (newStartDate > endDate) {
      const err = new Error('Start date cannot be after the end date.') as any;
      err.statusCode = 422; throw err;
    }

    const plan = sub.plans[0];

    // MOVING START LATER (removing early days)
    if (newStartDate > currentStartDate) {
      // Block if delivered slots exist in the removed range
      const blockedSlots = sub.delivery_slots.filter(s => {
        const d = new Date(s.scheduled_date); d.setHours(0,0,0,0);
        return d >= currentStartDate && d < newStartDate && s.status === 'delivered';
      });

      if (blockedSlots.length > 0) {
        const dates = blockedSlots
          .map(s => new Date(s.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))
          .slice(0, 5).join(', ');
        const err = new Error(
          `Cannot move start date forward: ${blockedSlots.length} delivered slot(s) exist before ` +
          `${newStartDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} ` +
          `(${dates}). Revert them to Pending first.`
        ) as any;
        err.statusCode = 422;
        throw err;
      }

      // Delete non-delivered slots before new start date
      const slotIdsToDelete = sub.delivery_slots
        .filter(s => { const d = new Date(s.scheduled_date); d.setHours(0,0,0,0); return d < newStartDate; })
        .map(s => s.id);
      if (slotIdsToDelete.length > 0) {
        await prisma.deliverySlot.deleteMany({ where: { id: { in: slotIdsToDelete } } });
      }

      // Auto-delete holidays before new start
      const holidayIdsToDelete = sub.holidays
        .filter(h => { const d = new Date(h.date); d.setHours(0,0,0,0); return d < newStartDate; })
        .map(h => h.id);
      if (holidayIdsToDelete.length > 0) {
        await prisma.customerHoliday.deleteMany({ where: { id: { in: holidayIdsToDelete } } });
      }
    }

    // MOVING START EARLIER (adding new early days)
    if (newStartDate < currentStartDate) {
      const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0);

      const holidayTimes = new Set(sub.holidays.map(h => { const d = new Date(h.date); d.setHours(0,0,0,0); return d.getTime(); }));
      const existingTimes = new Set(sub.delivery_slots.map(s => { const d = new Date(s.scheduled_date); d.setHours(0,0,0,0); return d.getTime(); }));

      const newSlots: any[] = [];
      const cursor = new Date(newStartDate);
      // Go up to (but not including) the current start date
      const stopBefore = new Date(currentStartDate);

      while (cursor < stopBefore) {
        const slotDate = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 0,0,0,0);
        const isPast = slotDate < todayMidnight;
        if (!holidayTimes.has(slotDate.getTime()) && !existingTimes.has(slotDate.getTime())) {
          newSlots.push({
            subscription_id:   sub.id, customer_id: sub.customer_id, address_id: sub.address_id,
            scheduled_date: slotDate, actual_date: isPast ? slotDate : null,
            status: isPast ? 'delivered' : 'pending',
            qty_ordered: plan?.qty_per_day ?? 1, qty_delivered: isPast ? (plan?.qty_per_day ?? 1) : null,
            price_at_delivery: plan?.price_per_unit ?? null, grade_id: plan?.grade_id ?? null,
            marked_by: isPast ? 'system' : null, marked_at: isPast ? slotDate : null,
          });
        }
        cursor.setDate(cursor.getDate() + 1);
      }

      if (newSlots.length > 0) {
        await prisma.deliverySlot.createMany({ data: newSlots, skipDuplicates: true });
        const pastNewSlots = newSlots.filter(s => s.status === 'delivered');
        if (pastNewSlots.length > 0) {
          const created = await prisma.deliverySlot.findMany({
            where: { subscription_id: sub.id, scheduled_date: { gte: newStartDate, lt: currentStartDate }, status: 'delivered' },
            select: { id: true, scheduled_date: true },
          });
          if (created.length > 0) {
            await prisma.billingEntry.createMany({
              data: created.map(s => ({
                delivery_slot_id: s.id, customer_id: sub.customer_id,
                subscription_id: sub.id, address_id: sub.address_id,
                delivery_date: s.scheduled_date, qty_delivered: plan?.qty_per_day ?? 1,
                price_per_unit: plan?.price_per_unit ?? 0,
                line_amount: (plan?.qty_per_day ?? 1) * (plan?.price_per_unit ?? 0),
              })),
              skipDuplicates: true,
            });
          }
        }
      }
    }

    // Update plan effective_from if start date changes
    if (plan) {
      const planStart = new Date(plan.effective_from);
      planStart.setHours(0,0,0,0);
      if (planStart.getTime() === currentStartDate.getTime()) {
        await prisma.subscriptionPlan.update({
          where: { id: plan.id },
          data:  { effective_from: newStartDate },
        });
      }
    }

    const totalDays = Math.round((endDate.getTime() - newStartDate.getTime()) / 86400000) + 1;
    await prisma.subscription.update({ where: { id: subscriptionId }, data: { start_date: newStartDate, total_days: totalDays } });

    return {
      message: newStartDate < currentStartDate ? 'Start date moved earlier' : 'Start date moved forward',
      total_days: totalDays,
      new_start_date: newStartDate.toISOString(),
    };
  }
}
