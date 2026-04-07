import { prisma } from '../server';

export class DeliveryService {
  static async getDeliveries(targetDate?: string) {
    // Use provided date or default to today (IST — TZ set at process start)
    let day: Date;
    if (targetDate) {
      // e.g. "2026-04-05" — parse as local midnight
      const [y, m, d] = targetDate.split('-').map(Number);
      day = new Date(y, m - 1, d, 0, 0, 0, 0);
    } else {
      day = new Date();
      day.setHours(0, 0, 0, 0);
    }
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);

    const slots = await prisma.deliverySlot.findMany({
      where: {
        scheduled_date: { gte: day, lt: nextDay },
        status: { not: 'holiday' },
      },
      include: {
        subscription: {
          include: {
            customer: true,
            plans: { orderBy: { effective_from: 'desc' }, take: 1, include: { grade: true } }
          }
        },
        address: true,
        grade:   true,
      },
      orderBy: { scheduled_date: 'asc' },
    });

    const total     = slots.length;
    const delivered = slots.filter(s => s.status === 'delivered').length;
    const pending   = slots.filter(s => s.status === 'pending').length;
    const skipped   = slots.filter(s => s.status === 'skipped').length;
    const missed    = slots.filter(s => s.status === 'missed').length;
    const completionPct = total > 0 ? Math.round((delivered / total) * 100) : 0;

    return { stats: { total, delivered, pending, skipped, missed, completionPct }, slots };
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
            plans: { orderBy: { effective_from: 'desc' }, take: 1, include: { grade: true } }
          }
        },
        grade: true,
      }
    });

    if (!slot) throw new Error(`Slot ${slotId} not found`);
    if (slot.status === 'holiday') throw new Error('Cannot mark a holiday slot as delivered/skipped');
    if (slot.status === action) return slot; // idempotent

    const now = new Date();

    // 2. Resolve price: slot-level grade override → subscription grade → plan price
    const effectiveGrade = slot.grade ?? slot.subscription.plans[0]?.grade ?? null;
    const pricePerUnit   = effectiveGrade?.price_per_unit
      ?? slot.subscription.plans[0]?.price_per_unit
      ?? slot.price_at_delivery
      ?? 70;

    const qtyDelivered = action === 'delivered'
      ? (qtyDeliveredOverride ?? slot.qty_ordered)
      : null;

    // 3. Update the delivery slot
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

    // 4. Billing entry (upsert = idempotent)
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
          qty_delivered:    qtyDelivered!,
          price_per_unit:   pricePerUnit,
          line_amount:      qtyDelivered! * pricePerUnit,
        }
      });
    }

    // 5. If skipped, remove billing entry
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

    // If no IDs provided, fetch all pending slots for today (exclude holiday)
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

    // Fetch full slot data
    const slots = await prisma.deliverySlot.findMany({
      where: { id: { in: targetIds }, status: { not: 'holiday' } },
      include: {
        subscription: {
          include: { plans: { orderBy: { effective_from: 'desc' }, take: 1, include: { grade: true } } }
        },
        grade: true,
      }
    });

    await prisma.$transaction(async (tx) => {
      for (const slot of slots) {
        if (slot.status === action) continue;

        const effectiveGrade = slot.grade ?? slot.subscription.plans[0]?.grade ?? null;
        const pricePerUnit   = effectiveGrade?.price_per_unit
          ?? slot.subscription.plans[0]?.price_per_unit
          ?? slot.price_at_delivery
          ?? 70;

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
