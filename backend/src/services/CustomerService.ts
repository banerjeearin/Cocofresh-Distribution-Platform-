import { prisma } from '../server';

export class CustomerService {
  static async createCustomer(data: {
    name: string;
    mobile: string;
    start_date: string;
    payment_mode: string;
    address: {
      label: string;
      address_line: string;
      landmark?: string;
    };
    plan: {
      qty_per_day: number;
      price_per_unit: number;
      grade_id?: string;
    };
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create Customer
      const customerCode = `LN-${Math.floor(1000 + Math.random() * 9000)}`;
      const customer = await tx.customer.create({
        data: {
          name:          data.name,
          mobile:        data.mobile,
          customer_code: customerCode,
          status:        'active',
        }
      });

      // 2. Create Address
      const address = await tx.customerAddress.create({
        data: {
          customer_id:  customer.id,
          label:        data.address.label,
          address_line: data.address.address_line,
          landmark:     data.address.landmark,
          status:       'active',
        }
      });

      // 3. Mark as primary
      await tx.customer.update({
        where: { id: customer.id },
        data:  { primary_address_id: address.id }
      });

      // 4. Create Subscription
      const startDate = new Date(data.start_date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 29); // 30-day cycle

      const subscription = await tx.subscription.create({
        data: {
          customer_id:  customer.id,
          address_id:   address.id,
          start_date:   startDate,
          end_date:     endDate,
          total_days:   30,
          payment_mode: data.payment_mode,
          status:       'active',
        }
      });

      // 5. Create Subscription Plan (single qty_per_day, optional grade)
      await tx.subscriptionPlan.create({
        data: {
          subscription_id: subscription.id,
          effective_from:  startDate,
          price_per_unit:  data.plan.price_per_unit,
          qty_per_day:     data.plan.qty_per_day,
          grade_id:        data.plan.grade_id ?? null,
          created_by:      'admin',
        }
      });

      // 6. Generate ONE DeliverySlot per day for the 30-day cycle
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      const cursor = new Date(startDate);
      const cycleEnd = new Date(endDate);
      cycleEnd.setHours(23, 59, 59, 999);

      while (cursor <= cycleEnd) {
        const slotDate = new Date(
          cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), 0, 0, 0, 0
        );
        const isPast = slotDate < todayMidnight;
        const status = isPast ? 'delivered' : 'pending';

        // Create ONE slot per day
        const slot = await tx.deliverySlot.create({
          data: {
            subscription_id:   subscription.id,
            customer_id:       customer.id,
            address_id:        address.id,
            scheduled_date:    slotDate,
            actual_date:       isPast ? slotDate : null,
            status,
            qty_ordered:       data.plan.qty_per_day,
            qty_delivered:     isPast ? data.plan.qty_per_day : null,
            price_at_delivery: data.plan.price_per_unit,
            grade_id:          data.plan.grade_id ?? null,
            marked_by:         isPast ? 'system' : null,
            marked_at:         isPast ? slotDate : null,
          }
        });

        // Auto-create billing entry for past slots
        if (isPast) {
          await tx.billingEntry.create({
            data: {
              delivery_slot_id: slot.id,
              customer_id:      customer.id,
              subscription_id:  subscription.id,
              address_id:       address.id,
              delivery_date:    slotDate,
              qty_delivered:    data.plan.qty_per_day,
              price_per_unit:   data.plan.price_per_unit,
              line_amount:      data.plan.qty_per_day * data.plan.price_per_unit,
            }
          });
        }

        cursor.setDate(cursor.getDate() + 1);
      }

      // 7. Welcome WhatsApp stub
      const messageBody = `Welcome ${customer.name} to LIIMRA Naturals! Your subscription at ${address.label} starts on ${startDate.toDateString()}. Pure Hydration. Naturally Delivered.`;
      await tx.waMessageLog.create({
        data: {
          customer_id:   customer.id,
          template_type: 'welcome',
          message_body:  messageBody,
        }
      });

      return { customer, address, subscription };
    });
  }

  static async getCustomers() {
    return prisma.customer.findMany({
      include: {
        primary_address: true,
        subscriptions: {
          where: { status: 'active' },
          include: {
            plans: {
              orderBy: { effective_from: 'desc' },
              take: 1,
              include: { grade: true },
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  static async getCustomerById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        payments: { orderBy: { payment_date: 'desc' } },
        billing_entries: { orderBy: { delivery_date: 'desc' } },
        wa_messages: { orderBy: { sent_at: 'desc' } },
        holidays: {
          orderBy: { date: 'desc' },
          include: { subscription: { select: { id: true, start_date: true, end_date: true, status: true } } }
        },
        subscriptions: {
          include: {
            address: true,
            plans: {
              orderBy: { effective_from: 'desc' },
              include: { grade: true },
            },
            delivery_slots: {
              orderBy: { scheduled_date: 'desc' },
              include: { grade: true },
            },
          }
        }
      }
    });
  }

  static async updateCustomerStats(id: string, data: { name?: string; mobile?: string; status?: string }) {
    return prisma.customer.update({ where: { id }, data });
  }
}
