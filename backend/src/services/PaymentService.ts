import { prisma } from '../server';

export class PaymentService {
  static async getPayments() {
    const payments = await prisma.payment.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        customer: true
      }
    });

    const outstanding = await prisma.billingEntry.aggregate({
      _sum: { line_amount: true }
    });
    
    // Simplistic placeholder for total collected
    const collected = await prisma.payment.aggregate({
      _sum: { amount: true }
    });

    return {
      payments,
      stats: {
        outstanding: outstanding._sum.line_amount || 0,
        collected: collected._sum.amount || 0,
        overdue_customers: 0 // Mock placeholder implementation
      }
    };
  }
}
