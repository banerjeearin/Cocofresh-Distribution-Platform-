import { prisma } from '../server';

// ─── Template message generator ───────────────────────────────────────────────
function buildMessage(template: string, customer: any): string {
  const name = customer.name ?? 'Customer';
  switch (template) {
    case 'invoice':
      return `Dear ${name},\n\nHere is your CocoFresh invoice for this month.\n\n🥥 Your subscription is active.\n💰 Kindly check your outstanding balance, if any.\n\nThank you for being a CocoFresh customer! 🥥\n\n_CocoFresh Distribution_`;
    case 'welcome':
      return `Welcome to CocoFresh, ${name}! 👋\n\nYour subscription has been activated. We look forward to delivering fresh coconuts to your doorstep every day!\n\nFor any queries, feel free to reach out.\n\n_CocoFresh Distribution_`;
    case 'delivery':
      return `Hi ${name}, ✅\n\nYour CocoFresh delivery for today has been completed successfully.\n\nThank you!\n_CocoFresh Distribution_`;
    case 'skip':
      return `Hi ${name}, ⏭\n\nWe have acknowledged your skip request for today's delivery slot. Your subscription continues as normal from tomorrow.\n\n_CocoFresh Distribution_`;
    case 'payment':
      return `Dear ${name}, 💰\n\nThis is a gentle reminder that you have an outstanding balance on your CocoFresh account. Kindly clear the dues at your earliest convenience.\n\nThank you!\n_CocoFresh Distribution_`;
    case 'renewal':
      return `Hi ${name}, 🔄\n\nYour CocoFresh subscription is expiring soon. Please renew to continue enjoying fresh coconuts without interruption.\n\n_CocoFresh Distribution_`;
    default:
      return `Dear ${name},\n\nA message from CocoFresh Distribution.`;
  }
}

export class WhatsAppService {
  static async getMessages() {
    const messages = await prisma.waMessageLog.findMany({
      orderBy: { sent_at: 'desc' },
      include: { customer: true }
    });

    const pendingCount = messages.filter(m => m.delivery_status === 'generated').length;
    const sentCount    = messages.filter(m => m.delivery_status !== 'generated').length;

    return { messages, stats: { pendingCount, sentCount } };
  }

  // Create a new WA message log entry (status: 'generated')
  static async logMessage(data: {
    customer_id:   string;
    template_type: string;
    message_body?: string;
  }) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customer_id } });
    if (!customer) throw new Error('Customer not found');

    const body = data.message_body ?? buildMessage(data.template_type, customer);

    return prisma.waMessageLog.create({
      data: {
        customer_id:     data.customer_id,
        template_type:   data.template_type,
        message_body:    body,
        delivery_status: 'generated',
        sent_at:         null,
      },
      include: { customer: true }
    });
  }

  // Mark an existing log entry as sent (status: 'delivered')
  static async markSent(id: string) {
    return prisma.waMessageLog.update({
      where: { id },
      data: {
        delivery_status: 'delivered',
        sent_at:         new Date(),
      }
    });
  }
}
