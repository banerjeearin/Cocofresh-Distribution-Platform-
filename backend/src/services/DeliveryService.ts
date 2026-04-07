import { prisma } from '../server';

export class DeliveryService {
  static async getDeliveries() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);   // IST midnight (TZ is set at process start)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const slots = await prisma.deliverySlot.findMany({
      where: { scheduled_date: { gte: today, lt: tomorrow } },
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

  static async markSlot(
    slotId:       string,
    action:       'delivered' | 'skipped',
    markedBy    = 'admin',
    qtyDeliveredOverride?: number
  ) {
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
    const qtyDelivered = action === 'delivered'
      ? (qtyDeliveredOverride ?? slot.qty_ordered)
      : null;
    const pricePerUnit = slot.subscription.plans[0]?.price_per_unit ?? slot.price_at_delivery ?? 30;

    const updated = await prisma.deliverySlot.update({
      where: { id: slotId },
      data: {
        status:            action,
        actual_date:       action === 'delivered' ? now : null,
        qty_delivered:     qtyDelivered,
        price_at_delivery: action === 'delivered' ? pricePerUnit : null,
        marked_by:         markedBy,
        marked_at:         now,
      }
    });

    // 3. If marking delivered — create billing entry (upsert keeps it idempotent)
    if (action === 'delivered') {
      await prisma.billingEntry.upsert({
        where: { delivery_slot_id: slotId },
        update: {
          qty_delivered:  qtyDelivered!,
          price_per_unit: pricePerUnit,
          line_amount:    qtyDelivered! * pricePerUnit,
        },
        create: {
          delivery_slot_id: slotId,
          customer_id:      slot.customer_id,
          subscription_id:  slot.subscription_id,
          address_id:       slot.address_id,
          delivery_date:    now,
          time_band:        slot.time_band,
          qty_delivered:    qtyDelivered!,
          price_per_unit:   pricePerUnit,
          line_amount:      qtyDelivered! * pricePerUnit,
        }
      });
    }

    // 4. If un-delivering (marking skipped), remove billing entry if it exists
    if (action === 'skipped') {
      await prisma.billingEntry.deleteMany({ where: { delivery_slot_id: slotId } });
    }

    return updated;
  }

  static async bulkMark(
    slotIds: string[] | undefined,
    action: 'delivered' | 'skipped',
    markedBy = 'admin'
  ) {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If no IDs provided, fetch all pending slots for today
    let targetIds: string[] = slotIds ?? [];
    if (!slotIds || slotIds.length === 0) {
      const pending = await prisma.deliverySlot.findMany({
        where: { scheduled_date: today, status: 'pending' },
        select: { id: true }
      });
      targetIds = pending.map(s => s.id);
    }

    if (targetIds.length === 0) {
      return { updated: 0, message: 'No pending slots found for today' };
    }

    // Fetch full slot data for billing entry creation
    const slots = await prisma.deliverySlot.findMany({
      where: { id: { in: targetIds } },
      include: {
        subscription: {
          include: { plans: { orderBy: { effective_from: 'desc' }, take: 1 } }
        }
      }
    });

    // Execute in a single transaction
    await prisma.$transaction(async (tx) => {
      for (const slot of slots) {
        if (slot.status === action) continue; // idempotent — skip already done

        const pricePerUnit = slot.subscription.plans[0]?.price_per_unit ?? slot.price_at_delivery ?? 30;

        await tx.deliverySlot.update({
          where: { id: slot.id },
          data: {
            status:            action,
            actual_date:       action === 'delivered' ? now : null,
            qty_delivered:     action === 'delivered' ? slot.qty_ordered : null,
            price_at_delivery: action === 'delivered' ? pricePerUnit : null,
            marked_by:         markedBy,
            marked_at:         now,
          }
        });

        if (action === 'delivered') {
          await tx.billingEntry.upsert({
            where:  { delivery_slot_id: slot.id },
            update: {
              qty_delivered:  slot.qty_ordered,
              price_per_unit: pricePerUnit,
              line_amount:    slot.qty_ordered * pricePerUnit,
            },
            create: {
              delivery_slot_id: slot.id,
              customer_id:      slot.customer_id,
              subscription_id:  slot.subscription_id,
              address_id:       slot.address_id,
              delivery_date:    now,
              time_band:        slot.time_band,
              qty_delivered:    slot.qty_ordered,
              price_per_unit:   pricePerUnit,
              line_amount:      slot.qty_ordered * pricePerUnit,
            }
          });
        }

        if (action === 'skipped') {
          await tx.billingEntry.deleteMany({ where: { delivery_slot_id: slot.id } });
        }
      }
    });

    return { updated: slots.length, action };
  }
}
