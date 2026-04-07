import { prisma } from '../server';

export class DashboardService {
  static async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // IST midnight (TZ is set at process level)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth   = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    // ── Customers ────────────────────────────────────────────────────────────
    const [total, active, paused, churned] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'active' } }),
      prisma.customer.count({ where: { status: 'paused' } }),
      prisma.customer.count({ where: { status: 'churned' } }),
    ]);

    if (total === 0) {
      return {
        customers: { total: 0, active: 0, paused: 0, churned: 0 },
        deliveries: { today_total: 0, today_done: 0, today_pending: 0, morning_done: 0, morning_total: 0, evening_done: 0, evening_total: 0 },
        revenue: { mtd_collected: 0, mtd_billed: 0, outstanding: 0, overdue_customers: 0 },
        attention: [],
        recent_payments: [],
      };
    }

    // ── Today's deliveries ────────────────────────────────────────────────────
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const todaySlots = await prisma.deliverySlot.findMany({
      where: { scheduled_date: { gte: today, lt: tomorrow } },
      select: { status: true, time_band: true }
    });

    const today_total    = todaySlots.length;
    const today_done     = todaySlots.filter(s => s.status === 'delivered').length;
    const today_pending  = todaySlots.filter(s => s.status === 'pending').length;
    const morning_total  = todaySlots.filter(s => s.time_band === 'morning').length;
    const morning_done   = todaySlots.filter(s => s.time_band === 'morning' && s.status === 'delivered').length;
    const evening_total  = todaySlots.filter(s => s.time_band === 'evening').length;
    const evening_done   = todaySlots.filter(s => s.time_band === 'evening' && s.status === 'delivered').length;

    // ── Revenue (MTD) ─────────────────────────────────────────────────────────
    const [billedAgg, collectedAgg] = await Promise.all([
      prisma.billingEntry.aggregate({
        _sum: { line_amount: true },
        where: { delivery_date: { gte: startOfMonth, lte: endOfMonth } }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { payment_date: { gte: startOfMonth, lte: endOfMonth } }
      }),
    ]);

    const mtd_billed    = billedAgg._sum.line_amount    ?? 0;
    const mtd_collected = collectedAgg._sum.amount      ?? 0;

    // Outstanding = total billed ever - total paid ever (net across all time)
    const [totalBilledAllTime, totalPaidAllTime] = await Promise.all([
      prisma.billingEntry.aggregate({ _sum: { line_amount: true } }),
      prisma.payment.aggregate({ _sum: { amount: true } }),
    ]);
    const outstanding = Math.max(0, (totalBilledAllTime._sum.line_amount ?? 0) - (totalPaidAllTime._sum.amount ?? 0));

    // Overdue customers = those with net outstanding > 0
    const allCustomers = await prisma.customer.findMany({
      where: { status: 'active' },
      include: { billing_entries: true, payments: true }
    });
    const overdue = allCustomers.filter(c => {
      const billed = c.billing_entries.reduce((s, e) => s + e.line_amount, 0);
      const paid   = c.payments.reduce((s, p) => s + p.amount, 0);
      return billed - paid > 0;
    });
    const overdue_customers = overdue.length;

    // ── Attention items (customers with outstanding balance) ─────────────────
    const attention = overdue.slice(0, 5).map(c => {
      const billed = c.billing_entries.reduce((s, e) => s + e.line_amount, 0);
      const paid   = c.payments.reduce((s, p) => s + p.amount, 0);
      return { customer_id: c.id, name: c.name, amount_due: Math.round(billed - paid) };
    });

    // ── Recent payments (last 5) ──────────────────────────────────────────────
    const recentPayments = await prisma.payment.findMany({
      orderBy: { payment_date: 'desc' },
      take: 5,
      include: { customer: { select: { name: true } } }
    });

    const recent_payments = recentPayments.map(p => ({
      name:         p.customer.name,
      amount:       p.amount,
      mode:         p.payment_mode,
      payment_date: p.payment_date,
    }));

    // ── Last 7 days delivery trend ────────────────────────────────────────────
    const week_trend = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const next = new Date(d); next.setDate(d.getDate() + 1);
        return prisma.deliverySlot.count({
          where: { scheduled_date: { gte: d, lt: next }, status: 'delivered' }
        }).then(count => ({
          label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
          delivered: count,
        }));
      })
    );

    return {
      customers: { total, active, paused, churned },
      deliveries: { today_total, today_done, today_pending, morning_done, morning_total, evening_done, evening_total },
      revenue: { mtd_collected: Math.round(mtd_collected), mtd_billed: Math.round(mtd_billed), outstanding: Math.round(outstanding), overdue_customers },
      attention,
      recent_payments,
      week_trend,
    };
  }
}
