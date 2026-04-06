import { prisma } from '../server';

export class DeliveryService {
  static async getDeliveries() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await prisma.deliverySlot.findMany({
      where: {
        scheduled_date: today
      },
      include: {
        subscription: { include: { customer: true } },
        address: true
      }
    });

    const total = slots.length;
    const delivered = slots.filter(s => s.status === 'delivered').length;
    const pending = slots.filter(s => s.status === 'pending').length;
    const skipped = slots.filter(s => s.status === 'skipped').length;
    const missed = slots.filter(s => s.status === 'missed').length;

    const morning = slots.filter(s => s.time_band === 'morning');
    const evening = slots.filter(s => s.time_band === 'evening');

    return {
      stats: { total, delivered, pending, skipped, missed },
      morning,
      evening
    };
  }
}
