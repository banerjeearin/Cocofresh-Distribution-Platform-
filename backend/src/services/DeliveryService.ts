import { prisma } from '../server';

export class DeliveryService {
  static async getDeliveries() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await prisma.deliverySlot.findMany({
      where: { scheduled_date: today },
      include: {
        subscription: { include: { customer: true, plans: { orderBy: { effective_from: 'desc' }, take: 1 } } },
        address: true
      },
      orderBy: { time_band: 'asc' }
    });

    const total     = slots.length;
    const delivered = slots.filter(s => s.status === 'delivered').length;
    const pending   = slots.filter(s => s.status === 'pending').length;
    const skipped   = slots.filter(s => s.status === 'skipped').length;
    const missed    = slots.filter(s => s.status === 'missed').length;

    const morning = slots.filter(s => s.time_band === 'morning');
    const evening = slots.filter(s => s.time_band === 'evening');

    // Compute completion %
    const completionPct = total > 0 ? Math.round((delivered / total) * 100) : 0;

    return { stats: { total, delivered, pending, skipped, missed, completionPct }, morning, evening };
  }

  static async markSlot(slotId: string, action: 'delivered' | 'skipped', markedBy = 'admin') {
    // 1. Fetch slot with its subscription plan
    const slot = await prisma.deliverySlot.findUnique({
      where: { id: slotId },
      include: {
        subscription: {
          include: {
            plans: { orderBy: { effective_from: 'desc' }, take: 1 }
          }
        }
      }
    });

    if (!slot) throw new Error(`Slot ${slotId} not found`);
    if (slot.status === action) return slot; // idempotent — already in this state

    const now = new Date();

    // 2. Update the delivery slot
    const updated = await prisma.deliverySlot.update({
      where: { id: slotId },
      data: {
        status:       action,
        actual_date:  action === 'delivered' ? now : null,
        qty_delivered: action === 'delivered' ? slot.qty_ordered : null,
        price_at_delivery: action === 'delivered'
          ? (slot.subscription.plans[0]?.price_per_unit ?? slot.price_at_delivery)
          : null,
        marked_by: markedBy,
        marked_at:  now,
      }
    });

    // 3. If marking delivered — create billing entry (upsert to keep idempotent)
    if (action === 'delivered') {
      const pricePerUnit = slot.subscription.plans[0]?.price_per_unit ?? 30;
      const qtyDelivered = slot.qty_ordered;

      await prisma.billingEntry.upsert({
        where: { delivery_slot_id: slotId },
        update: {
          qty_delivered:  qtyDelivered,
          price_per_unit: pricePerUnit,
          line_amount:    qtyDelivered * pricePerUnit,
        },
        create: {
          delivery_slot_id: slotId,
          customer_id:      slot.customer_id,
          subscription_id:  slot.subscription_id,
          address_id:       slot.address_id,
          delivery_date:    now,
          time_band:        slot.time_band,
          qty_delivered:    qtyDelivered,
          price_per_unit:   pricePerUnit,
          line_amount:      qtyDelivered * pricePerUnit,
        }
      });
    }

    // 4. If un-delivering (marking skipped), remove billing entry if it exists
    if (action === 'skipped') {
      await prisma.billingEntry.deleteMany({ where: { delivery_slot_id: slotId } });
    }

    return updated;
  }
}
