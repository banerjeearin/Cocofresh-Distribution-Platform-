import { prisma } from '../server';

export class InvoiceService {
  static async getInvoices(year?: number, month?: number) {
    const now = new Date();
    const y = year  ?? now.getFullYear();
    const m = month ?? now.getMonth() + 1; // 1-based

    const startOfMonth = new Date(y, m - 1, 1, 0, 0, 0);
    const endOfMonth   = new Date(y, m,     0, 23, 59, 59);

    const entries = await prisma.billingEntry.findMany({
      where: { delivery_date: { gte: startOfMonth, lte: endOfMonth } },
      orderBy: { delivery_date: 'asc' },
      include: {
        customer: true,
        address:  true,
      }
    });

    // Per-customer payment totals for the invoice
    const customerIds = [...new Set(entries.map(e => e.customer_id))];

    const paymentTotals = await Promise.all(
      customerIds.map(async cid => {
        const agg = await prisma.payment.aggregate({
          _sum: { amount: true },
          where: { customer_id: cid }
        });
        const billedAgg = await prisma.billingEntry.aggregate({
          _sum: { line_amount: true },
          where: { customer_id: cid }
        });
        return {
          customer_id: cid,
          total_paid:    agg._sum.amount ?? 0,
          total_billed:  billedAgg._sum.line_amount ?? 0,
        };
      })
    );

    const paymentMap = Object.fromEntries(paymentTotals.map(p => [p.customer_id, p]));

    return { entries, paymentMap, period: { year: y, month: m } };
  }
}
