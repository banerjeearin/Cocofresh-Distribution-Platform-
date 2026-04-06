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
      morning_qty: number;
      evening_qty: number;
      price_per_unit: number;
    }
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create Customer
      const customerCode = `CCF-${Math.floor(1000 + Math.random() * 9000)}`; // Simple random for now
      const customer = await tx.customer.create({
        data: {
          name: data.name,
          mobile: data.mobile,
          customer_code: customerCode,
          status: "active",
        }
      });

      // 2. Create Address
      const address = await tx.customerAddress.create({
        data: {
          customer_id: customer.id,
          label: data.address.label,
          address_line: data.address.address_line,
          landmark: data.address.landmark,
          status: "active",
        }
      });

      // 3. Mark as primary
      await tx.customer.update({
        where: { id: customer.id },
        data: { primary_address_id: address.id }
      });

      // 4. Create Subscription
      const startDate = new Date(data.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 29); // 30 day cycle

      const subscription = await tx.subscription.create({
        data: {
          customer_id: customer.id,
          address_id: address.id,
          start_date: startDate,
          end_date: endDate,
          total_days: 30,
          payment_mode: data.payment_mode,
          status: "active"
        }
      });

      // 5. Create Subscription Plan
      await tx.subscriptionPlan.create({
        data: {
          subscription_id: subscription.id,
          effective_from: startDate,
          price_per_unit: data.plan.price_per_unit,
          morning_qty: data.plan.morning_qty,
          evening_qty: data.plan.evening_qty,
          created_by: 'admin'
        }
      });

      // 6. Generate DeliverySlot rows for every day in the subscription cycle
      //    Past days → 'delivered', today → 'pending', future → 'pending'
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      const timeBands: Array<{ band: 'morning' | 'evening'; qty: number }> = [];
      if (data.plan.morning_qty > 0) timeBands.push({ band: 'morning', qty: data.plan.morning_qty });
      if (data.plan.evening_qty > 0) timeBands.push({ band: 'evening', qty: data.plan.evening_qty });

      // Loop from startDate to endDate (inclusive, 30 days)
      const cursor = new Date(startDate);
      cursor.setHours(0, 0, 0, 0);
      const cycleEnd = new Date(endDate);
      cycleEnd.setHours(0, 0, 0, 0);

      while (cursor <= cycleEnd) {
        const slotDate = new Date(cursor);
        const isPast   = slotDate < todayMidnight;
        const status   = isPast ? 'delivered' : 'pending';

        for (const tb of timeBands) {
          // Create the delivery slot first
          const slot = await tx.deliverySlot.create({
            data: {
              subscription_id:   subscription.id,
              customer_id:       customer.id,
              address_id:        address.id,
              scheduled_date:    slotDate,
              actual_date:       isPast ? slotDate : null,
              time_band:         tb.band,
              status,
              qty_ordered:       tb.qty,
              qty_delivered:     isPast ? tb.qty : null,
              price_at_delivery: data.plan.price_per_unit,
              marked_by:         isPast ? 'system' : null,
              marked_at:         isPast ? slotDate : null,
            }
          });

          // Create billing entry only for past (auto-delivered) slots
          if (isPast) {
            await tx.billingEntry.create({
              data: {
                delivery_slot_id: slot.id,
                customer_id:      customer.id,
                subscription_id:  subscription.id,
                address_id:       address.id,
                delivery_date:    slotDate,
                time_band:        tb.band,
                qty_delivered:    tb.qty,
                price_per_unit:   data.plan.price_per_unit,
                line_amount:      tb.qty * data.plan.price_per_unit,
              }
            });
          }
        }

        cursor.setDate(cursor.getDate() + 1);
      }

      // WhatsApp Stub (FR-006)
      const messageBody = `Welcome ${customer.name} to CocoFresh! Your subscription at ${address.label} starts on ${startDate.toDateString()}.`;
      await tx.waMessageLog.create({
        data: {
          customer_id: customer.id,
          template_type: 'welcome',
          message_body: messageBody,
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
          where: { status: "active" },
          include: {
            plans: {
              orderBy: { effective_from: 'desc' },
              take: 1
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
        payments: {
          orderBy: { payment_date: 'desc' }
        },
        billing_entries: {
          orderBy: { delivery_date: 'desc' }
        },
        wa_messages: {
          orderBy: { sent_at: 'desc' }
        },
        subscriptions: {
          include: {
            address: true,
            plans: {
              orderBy: { effective_from: 'desc' }
            },
            delivery_slots: {
              orderBy: { scheduled_date: 'desc' }
            }
          }
        }
      }
    });
  }

  static async updateCustomerStats(id: string, data: { name?: string, mobile?: string, status?: string }) {
    return prisma.customer.update({
      where: { id },
      data
    });
  }
}
