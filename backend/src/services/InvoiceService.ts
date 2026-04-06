import { prisma } from '../server';

export class InvoiceService {
  static async getInvoices() {
    const entries = await prisma.billingEntry.findMany({
      orderBy: { delivery_date: 'desc' },
      include: {
        customer: true,
        address: true
      }
    });

    return { entries };
  }
}
