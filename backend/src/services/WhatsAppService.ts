import { prisma } from '../server';

export class WhatsAppService {
  static async getMessages() {
    const messages = await prisma.waMessageLog.findMany({
      orderBy: { sent_at: 'desc' },
      include: {
        customer: true
      }
    });

    const pendingCount = messages.filter(m => m.delivery_status === 'generated').length;
    const sentCount = messages.filter(m => m.delivery_status !== 'generated').length;

    return {
      messages,
      stats: { pendingCount, sentCount }
    };
  }
}
