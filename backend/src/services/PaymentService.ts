import { prisma } from '../server';

export class PaymentService {
  static async getPayments() {
    const payments = await prisma.payment.findMany({
      orderBy: { payment_date: 'desc' },
      include: { customer: true }
    });

    const billedAgg = await prisma.billingEntry.aggregate({ _sum: { line_amount: true } });
    const paidAgg   = await prisma.payment.aggregate({ _sum: { amount: true } });

    const totalBilled    = billedAgg._sum.line_amount ?? 0;
    const totalCollected = paidAgg._sum.amount ?? 0;
    const outstanding    = Math.max(0, totalBilled - totalCollected);

    // Per-customer balance breakdown
    const customers = await prisma.customer.findMany({
      where: { status: { not: 'churned' } },
      include: {
        billing_entries: { select: { line_amount: true } },
        payments:        { select: { amount: true, payment_date: true } },
      }
    });

    const customer_balances = customers.map(c => {
      const billed = c.billing_entries.reduce((s, e) => s + e.line_amount, 0);
      const paid   = c.payments.reduce((s, p) => s + p.amount, 0);
      const balance = billed - paid;
      const lastPaid = c.payments.sort((a, b) =>
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      )[0]?.payment_date ?? null;
      return {
        id:         c.id,
        name:       c.name,
        code:       c.customer_code,
        status:     c.status,
        billed,
        paid,
        balance,
        last_paid:  lastPaid,
      };
    }).filter(c => c.billed > 0); // only show customers with any billing

    const overdue_customers = customer_balances.filter(c => c.balance > 0).length;

    return {
      payments,
      stats: {
        outstanding,
        collected: totalCollected,
        total_billed: totalBilled,
        overdue_customers,
      },
      customer_balances,
    };
  }

  static async getReceipt(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        customer: {
          include: {
            addresses: { where: { status: 'active' }, take: 1 },
          }
        },
        subscription: {
          include: {
            plans: { orderBy: { effective_from: 'desc' }, take: 1 }
          }
        }
      }
    });

    if (!payment) throw new Error(`Payment ${paymentId} not found`);

    // Get billing entries for the same customer around the payment date
    const startOfMonth = new Date(payment.payment_date);
    startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59);

    const billing = await prisma.billingEntry.findMany({
      where: {
        customer_id:   payment.customer_id,
        delivery_date: { gte: startOfMonth, lte: endOfMonth },
      },
      orderBy: { delivery_date: 'asc' }
    });

    const totalBilledMonth = billing.reduce((s, e) => s + e.line_amount, 0);
    const totalPaidAllTime = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { customer_id: payment.customer_id }
    });
    const totalBilledAllTime = await prisma.billingEntry.aggregate({
      _sum: { line_amount: true },
      where: { customer_id: payment.customer_id }
    });
    const netOutstanding = Math.max(0, (totalBilledAllTime._sum.line_amount ?? 0) - (totalPaidAllTime._sum.amount ?? 0));

    return {
      payment,
      billing_this_month: billing,
      summary: {
        month_billed:    totalBilledMonth,
        payment_amount:  payment.amount,
        net_outstanding: netOutstanding,
      }
    };
  }

  static async recordPayment(data: {
    customer_id: string;
    amount: number;
    payment_mode: string;
    reference?: string;
    payment_date?: string;
  }) {
    const subscription = await prisma.subscription.findFirst({
      where: { customer_id: data.customer_id, status: 'active' },
      orderBy: { start_date: 'desc' }
    });

    if (!subscription) {
      throw new Error('No active subscription found for this customer.');
    }

    const payment = await prisma.payment.create({
      data: {
        customer_id:     data.customer_id,
        subscription_id: subscription.id,
        amount:          data.amount,
        payment_mode:    data.payment_mode,
        reference:       data.reference ?? null,
        payment_date:    data.payment_date ? new Date(data.payment_date) : new Date(),
        recorded_by:     'admin',
      },
      include: { customer: true }
    });

    return payment;
  }
}
