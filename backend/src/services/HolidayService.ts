import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function toISTMidnight(date: string | Date): Date {
  const d = new Date(date);
  // Normalize to IST midnight (UTC+5:30 = offset 330 min)
  const ist = new Date(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
  return ist;
}

function daysBetween(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export const HolidayService = {

  // ── List holidays for a customer ─────────────────────────────────────────
  async getHolidays(customerId: string) {
    return prisma.customerHoliday.findMany({
      where: { customer_id: customerId },
      orderBy: { date: 'desc' },
      include: { subscription: { select: { id: true, start_date: true, end_date: true, status: true } } },
    });
  },

  // ── Add a single holiday ─────────────────────────────────────────────────
  async addHoliday(customerId: string, subscriptionId: string, dateStr: string, reason?: string) {
    const date = toISTMidnight(dateStr);

    // Check for duplicate
    const existing = await prisma.customerHoliday.findUnique({
      where: { subscription_id_date: { subscription_id: subscriptionId, date } },
    });
    if (existing) return { holiday: existing, extended_to: null, message: 'Already marked as holiday' };

    // Create or update the delivery slot to holiday status
    await HolidayService._upsertHolidaySlot(customerId, subscriptionId, date);

    // Create holiday record
    const holiday = await prisma.customerHoliday.create({
      data: { customer_id: customerId, subscription_id: subscriptionId, date, reason },
    });

    // Extend subscription end_date by 1
    const sub = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { end_date: { set: await HolidayService._addDays(subscriptionId, 1) } },
    });

    return { holiday, extended_to: sub.end_date, message: 'Holiday added, subscription extended by 1 day' };
  },

  // ── Add a range of holidays ──────────────────────────────────────────────
  async addHolidayRange(customerId: string, subscriptionId: string, startDateStr: string, endDateStr: string, reason?: string) {
    const start = toISTMidnight(startDateStr);
    const end   = toISTMidnight(endDateStr);
    const dates = daysBetween(start, end);

    let added = 0;
    const holidays = [];

    for (const date of dates) {
      const existing = await prisma.customerHoliday.findUnique({
        where: { subscription_id_date: { subscription_id: subscriptionId, date } },
      });
      if (existing) continue;

      await HolidayService._upsertHolidaySlot(customerId, subscriptionId, date);

      const holiday = await prisma.customerHoliday.create({
        data: { customer_id: customerId, subscription_id: subscriptionId, date, reason },
      });
      holidays.push(holiday);
      added++;
    }

    // Extend end_date by total new holidays added
    let newEndDate = null;
    if (added > 0) {
      const sub = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { end_date: { set: await HolidayService._addDays(subscriptionId, added) } },
      });
      newEndDate = sub.end_date;
    }

    return {
      holidays,
      added,
      skipped: dates.length - added,
      extended_to: newEndDate,
      message: `${added} holiday(s) added, subscription extended by ${added} day(s)`,
    };
  },

  // ── Remove a holiday ─────────────────────────────────────────────────────
  async removeHoliday(holidayId: string) {
    const holiday = await prisma.customerHoliday.findUnique({ where: { id: holidayId } });
    if (!holiday) throw new Error('Holiday not found');

    // Revert the slot from holiday → pending (if it exists and is still holiday)
    const slot = await prisma.deliverySlot.findFirst({
      where: {
        subscription_id: holiday.subscription_id,
        scheduled_date:  holiday.date,
        status:          'holiday',
      },
    });

    if (slot) {
      // Only delete the slot if it was created solely for the holiday (no actual_date set)
      // Otherwise revert to pending
      if (!slot.actual_date) {
        await prisma.deliverySlot.delete({ where: { id: slot.id } });
      } else {
        await prisma.deliverySlot.update({ where: { id: slot.id }, data: { status: 'pending' } });
      }
    }

    // Delete the holiday record
    await prisma.customerHoliday.delete({ where: { id: holidayId } });

    // Reduce subscription end_date by 1
    const sub = await prisma.subscription.update({
      where: { id: holiday.subscription_id },
      data: { end_date: { set: await HolidayService._addDays(holiday.subscription_id, -1) } },
    });

    return { removed: holiday, new_end_date: sub.end_date };
  },

  // ── Internal: upsert a slot as 'holiday' ─────────────────────────────────
  async _upsertHolidaySlot(customerId: string, subscriptionId: string, date: Date) {
    // Get the subscription to find address
    const sub = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plans: { orderBy: { effective_from: 'desc' }, take: 1 } },
    });
    if (!sub) return;

    const existingSlot = await prisma.deliverySlot.findFirst({
      where: { subscription_id: subscriptionId, scheduled_date: date },
    });

    if (existingSlot) {
      // Update existing slot to holiday
      await prisma.deliverySlot.update({
        where: { id: existingSlot.id },
        data: { status: 'holiday' },
      });
    } else {
      // Create a new slot with holiday status (for future dates)
      await prisma.deliverySlot.create({
        data: {
          subscription_id:  subscriptionId,
          customer_id:      customerId,
          address_id:       sub.address_id,
          scheduled_date:   date,
          status:           'holiday',
          qty_ordered:      sub.plans[0]?.qty_per_day ?? 1,
          grade_id:         sub.plans[0]?.grade_id ?? null,
        },
      });
    }
  },

  // ── Internal: calculate new end_date after adding N days ─────────────────
  async _addDays(subscriptionId: string, n: number): Promise<Date> {
    const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new Error('Subscription not found');
    const d = new Date(sub.end_date);
    d.setDate(d.getDate() + n);
    return d;
  },
};
