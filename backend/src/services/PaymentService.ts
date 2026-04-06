import { prisma } from '../server';

export class PaymentService {
  static async getPayments() {
    const payments = await prisma.payment.findMany({
      orderBy: { created_at: 'desc' },
      include: { customer: true }
    });

    const billedAgg = await prisma.billingEntry.aggregate({ _sum: { line_amount: true } });
    const paidAgg   = await prisma.payment.aggregate({ _sum: { amount: true } });

    const totalBilled    = billedAgg._sum.line_amount ?? 0;
    const totalCollected = paidAgg._sum.amount ?? 0;
    const outstanding    = Math.max(0, totalBilled - totalCollected);

    // Count customers with net outstanding > 0
    const customers = await prisma.customer.findMany({
      include: {
        billing_entries: true,
        payments: true,
      }
    });

    const overdue_customers = customers.filter(c => {
      const billed = c.billing_entries.reduce((s, e) => s + e.line_amount, 0);
      const paid   = c.payments.reduce((s, p) => s + p.amount, 0);
      return billed - paid > 0;
    }).length;

    return {
      payments,
      stats: { outstanding, collected: totalCollected, overdue_customers }
    };
  }

  static async recordPayment(data: {
    customer_id: string;
    amount: number;
    payment_mode: string;
    reference?: string;
    payment_date?: string;
  }) {
    // Find the customer's active subscription
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
