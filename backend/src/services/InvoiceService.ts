import { prisma } from '../server';

export class InvoiceService {
  /**
   * Returns invoice data for a given month.
   * Source of truth: DeliverySlot with status='delivered' in the period.
   * Falls back to slot.price_at_delivery and slot.qty_delivered for amounts.
   * Also returns slot breakdown (delivered, skipped, holiday, missed, pending).
   */
  static async getInvoices(year?: number, month?: number) {
    const now = new Date();
    const y = year  ?? now.getFullYear();
    const m = month ?? now.getMonth() + 1; // 1-based

    const startOfMonth = new Date(y, m - 1, 1,  0,  0,  0);
    const endOfMonth   = new Date(y, m,     0, 23, 59, 59);

    // ── 1. All delivery slots for the period (all statuses — for breakdown summary)
    const allSlots = await prisma.deliverySlot.findMany({
      where: {
        scheduled_date: { gte: startOfMonth, lte: endOfMonth },
        status: { not: 'holiday' }, // holidays don't count as scheduled
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
        billing_entry: true,
      },
      orderBy: { scheduled_date: 'asc' },
    });

    // ── 2. Build per-customer groups
    const customerMap = new Map<string, {
      customer: any;
      delivered: any[];
      skipped:   number;
      missed:    number;
      pending:   number;
    }>();

    for (const slot of allSlots) {
      const cid = slot.customer_id;
      if (!customerMap.has(cid)) {
        customerMap.set(cid, {
          customer:  slot.subscription.customer,
          delivered: [],
          skipped:   0,
          missed:    0,
          pending:   0,
        });
      }
      const group = customerMap.get(cid)!;
      if (slot.status === 'delivered') {
        // Resolve price: billing entry → slot price_at_delivery → plan grade price → plan price
        const price = slot.billing_entry?.price_per_unit
          ?? slot.price_at_delivery
          ?? slot.grade?.price_per_unit
          ?? slot.subscription.plans[0]?.grade?.price_per_unit
          ?? slot.subscription.plans[0]?.price_per_unit
          ?? 70;

        const qty = slot.billing_entry?.qty_delivered
          ?? slot.qty_delivered
          ?? slot.qty_ordered;

        const gradeLabel = slot.grade?.label
          ?? slot.subscription.plans[0]?.grade?.label
          ?? null;

        group.delivered.push({
          id:           slot.id,
          delivery_date: slot.actual_date ?? slot.scheduled_date,
          scheduled_date: slot.scheduled_date,
          qty_delivered: qty,
          qty_ordered:   slot.qty_ordered,
          price_per_unit: price,
          line_amount:   qty * price,
          grade_label:   gradeLabel,
          address:       slot.address,
          customer_id:   cid,
        });
      } else if (slot.status === 'skipped') {
        group.skipped++;
      } else if (slot.status === 'missed') {
        group.missed++;
      } else if (slot.status === 'pending') {
        group.pending++;
      }
    }

    // Build the flat "entries" array (only delivered) + per-customer stats
    const customerStats: Record<string, {
      delivered_count: number;
      skipped_count:   number;
      missed_count:    number;
      pending_count:   number;
      total_billed:    number;
    }> = {};

    const entries: any[] = [];

    for (const [cid, group] of customerMap.entries()) {
      const monthTotal = group.delivered.reduce((s, e) => s + e.line_amount, 0);
      customerStats[cid] = {
        delivered_count: group.delivered.length,
        skipped_count:   group.skipped,
        missed_count:    group.missed,
        pending_count:   group.pending,
        total_billed:    monthTotal,
      };

      for (const e of group.delivered) {
        entries.push({ ...e, customer: group.customer });
      }
    }

    // ── 3. Per-customer payment totals (all time)
    const customerIds = [...customerMap.keys()];

    const paymentTotals = await Promise.all(
      customerIds.map(async cid => {
        const paidAgg = await prisma.payment.aggregate({
          _sum: { amount: true },
          where: { customer_id: cid }
        });
        const billedAgg = await prisma.billingEntry.aggregate({
          _sum: { line_amount: true },
          where: { customer_id: cid }
        });
        return {
          customer_id:  cid,
          total_paid:   paidAgg._sum.amount       ?? 0,
          total_billed: billedAgg._sum.line_amount ?? 0,
        };
      })
    );

    const paymentMap = Object.fromEntries(paymentTotals.map(p => [p.customer_id, p]));

    return {
      entries,
      paymentMap,
      customerStats,
      period: { year: y, month: m },
    };
  }
}
