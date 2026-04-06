import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CocoFresh database...');

  // ─── CLEAR ALL TABLES (order matters for FK constraints) ───
  await prisma.waMessageLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.billingEntry.deleteMany();
  await prisma.deliverySlot.deleteMany();
  await prisma.planChangeLog.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.customerAddress.deleteMany();
  await prisma.customer.deleteMany();
  console.log('🗑️  Cleared all tables');

  // ─── CUSTOMERS ────────────────────────────────────────────
  const customers = [
    { customer_code: 'CCF-001', name: 'Rahul Arora',   mobile: '+91 98765 43210', status: 'active' },
    { customer_code: 'CCF-002', name: 'Priya Sharma',  mobile: '+91 91234 56789', status: 'active' },
    { customer_code: 'CCF-003', name: 'Sunita Gupta',  mobile: '+91 88122 44556', status: 'active' },
    { customer_code: 'CCF-004', name: 'Arjun Mehta',   mobile: '+91 99001 55667', status: 'active' },
    { customer_code: 'CCF-005', name: 'Neha Kapoor',   mobile: '+91 77889 00112', status: 'active' },
    { customer_code: 'CCF-006', name: 'Manoj Kumar',   mobile: '+91 70123 45678', status: 'active' },
    { customer_code: 'CCF-007', name: 'Anita Desai',   mobile: '+91 91111 22233', status: 'paused'  },
    { customer_code: 'CCF-008', name: 'Vikram Singh',  mobile: '+91 82234 55678', status: 'active' },
  ];

  const createdCustomers: any[] = [];
  for (const c of customers) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }
  console.log(`✅ Created ${createdCustomers.length} customers`);

  // ─── ADDRESSES ────────────────────────────────────────────
  const addressData = [
    { customer: 'CCF-001', label: 'Home',   line: 'Flat 4B, Andheri West, Mumbai – 400053' },
    { customer: 'CCF-001', label: 'Office', line: 'Tower A, BKC, Mumbai – 400051' },
    { customer: 'CCF-002', label: 'Home',   line: 'Bandra West, Mumbai – 400050' },
    { customer: 'CCF-003', label: 'Home',   line: 'Malad West, Mumbai – 400064' },
    { customer: 'CCF-004', label: 'Home',   line: 'Goregaon East, Mumbai – 400063' },
    { customer: 'CCF-005', label: 'Home',   line: 'Powai, Mumbai – 400076' },
    { customer: 'CCF-006', label: 'Home',   line: 'Borivali East, Mumbai – 400066' },
    { customer: 'CCF-007', label: 'Home',   line: 'Kandivali West, Mumbai – 400067' },
    { customer: 'CCF-008', label: 'Home',   line: 'Dahisar East, Mumbai – 400068' },
  ];

  const createdAddresses: any[] = [];
  for (const a of addressData) {
    const cust = createdCustomers.find(c => c.customer_code === a.customer)!;
    const addr = await prisma.customerAddress.create({
      data: {
        customer_id: cust.id,
        label: a.label,
        address_line: a.line,
        status: 'active',
      }
    });
    createdAddresses.push({ ...addr, customer_code: a.customer });
  }

  // Update primary_address_id for each customer (first address)
  for (const cust of createdCustomers) {
    const primary = createdAddresses.find(a => a.customer_code === cust.customer_code);
    if (primary) {
      await prisma.customer.update({
        where: { id: cust.id },
        data: { primary_address_id: primary.id }
      });
    }
  }
  console.log(`✅ Created ${createdAddresses.length} addresses`);

  // ─── SUBSCRIPTIONS + PLANS ────────────────────────────────
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth   = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const subConfigs = [
    { code: 'CCF-001', addrLabel: 'Home',   mode: 'advance', morningQty: 2, eveningQty: 2, price: 30 },
    { code: 'CCF-002', addrLabel: 'Home',   mode: 'cod',     morningQty: 1, eveningQty: 0, price: 30 },
    { code: 'CCF-003', addrLabel: 'Home',   mode: 'advance', morningQty: 2, eveningQty: 2, price: 30 },
    { code: 'CCF-004', addrLabel: 'Home',   mode: 'advance', morningQty: 3, eveningQty: 3, price: 30 },
    { code: 'CCF-005', addrLabel: 'Home',   mode: 'cod',     morningQty: 2, eveningQty: 2, price: 30 },
    { code: 'CCF-006', addrLabel: 'Home',   mode: 'cod',     morningQty: 3, eveningQty: 0, price: 30 },
    { code: 'CCF-008', addrLabel: 'Home',   mode: 'advance', morningQty: 2, eveningQty: 2, price: 30 },
  ];

  const createdSubs: any[] = [];
  for (const s of subConfigs) {
    const cust = createdCustomers.find(c => c.customer_code === s.code)!;
    const addr = createdAddresses.find(a => a.customer_code === s.code && a.label === s.addrLabel)!;
    const sub = await prisma.subscription.create({
      data: {
        customer_id:  cust.id,
        address_id:   addr.id,
        start_date:   startOfMonth,
        end_date:     endOfMonth,
        total_days:   30,
        payment_mode: s.mode,
        status:       'active',
      }
    });
    await prisma.subscriptionPlan.create({
      data: {
        subscription_id: sub.id,
        effective_from:  startOfMonth,
        price_per_unit:  s.price,
        morning_qty:     s.morningQty,
        evening_qty:     s.eveningQty,
      }
    });
    createdSubs.push({ ...sub, cfg: s, addr });
  }
  console.log(`✅ Created ${createdSubs.length} subscriptions`);

  // ─── DELIVERY SLOTS + BILLING ENTRIES (past 6 days + today) ──
  let slotCount = 0;
  let billingCount = 0;

  for (const sub of createdSubs) {
    const cfg = sub.cfg;
    const timeBands: Array<{ band: string; qty: number }> = [];
    if (cfg.morningQty > 0) timeBands.push({ band: 'morning', qty: cfg.morningQty });
    if (cfg.eveningQty > 0) timeBands.push({ band: 'evening', qty: cfg.eveningQty });

    // Generate slots for last 6 days + today
    for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() - daysAgo);
      slotDate.setHours(0, 0, 0, 0);

      for (const tb of timeBands) {
        const isToday = daysAgo === 0;
        // Past days are delivered, today's morning is delivered, evening is pending
        const status = !isToday ? 'delivered' : (tb.band === 'morning' ? 'delivered' : 'pending');

        const slot = await prisma.deliverySlot.create({
          data: {
            subscription_id:  sub.id,
            customer_id:      sub.customer_id,
            address_id:       sub.address_id,
            scheduled_date:   slotDate,
            actual_date:      status === 'delivered' ? slotDate : null,
            time_band:        tb.band,
            status,
            qty_ordered:      tb.qty,
            qty_delivered:    status === 'delivered' ? tb.qty : null,
            price_at_delivery: cfg.price,
          }
        });
        slotCount++;

        // Create billing entry for delivered slots
        if (status === 'delivered') {
          await prisma.billingEntry.create({
            data: {
              delivery_slot_id: slot.id,
              customer_id:      sub.customer_id,
              subscription_id:  sub.id,
              address_id:       sub.address_id,
              delivery_date:    slotDate,
              time_band:        tb.band,
              qty_delivered:    tb.qty,
              price_per_unit:   cfg.price,
              line_amount:      tb.qty * cfg.price,
            }
          });
          billingCount++;
        }
      }
    }
  }
  console.log(`✅ Created ${slotCount} delivery slots`);
  console.log(`✅ Created ${billingCount} billing entries`);

  // ─── PAYMENTS ─────────────────────────────────────────────
  const paymentData = [
    { code: 'CCF-001', amount: 5280, mode: 'upi',  ref: 'UPI-TXN-8823' },
    { code: 'CCF-003', amount: 3600, mode: 'bank', ref: 'NEFT-4421AA'   },
    { code: 'CCF-004', amount: 6300, mode: 'upi',  ref: 'UPI-TXN-9944' },
    { code: 'CCF-008', amount: 2400, mode: 'cash', ref: null             },
  ];

  for (const p of paymentData) {
    const cust = createdCustomers.find(c => c.customer_code === p.code)!;
    const sub  = createdSubs.find(s => s.customer_id === cust.id)!;
    await prisma.payment.create({
      data: {
        customer_id:     cust.id,
        subscription_id: sub.id,
        amount:          p.amount,
        payment_date:    new Date(today.getFullYear(), today.getMonth(), 1),
        payment_mode:    p.mode,
        reference:       p.ref,
        recorded_by:     'admin',
      }
    });
  }
  console.log(`✅ Created ${paymentData.length} payments`);

  // ─── WHATSAPP MESSAGE LOG ─────────────────────────────────
  const waData = [
    { code: 'CCF-001', template: 'invoice',  status: 'delivered' },
    { code: 'CCF-002', template: 'welcome',  status: 'delivered' },
    { code: 'CCF-003', template: 'invoice',  status: 'generated' },
    { code: 'CCF-004', template: 'payment',  status: 'generated' },
    { code: 'CCF-005', template: 'delivery', status: 'delivered' },
  ];

  for (const w of waData) {
    const cust = createdCustomers.find(c => c.customer_code === w.code)!;
    await prisma.waMessageLog.create({
      data: {
        customer_id:     cust.id,
        template_type:   w.template,
        message_body:    `Dear ${cust.name}, this is your CocoFresh ${w.template} message.`,
        sent_at:         w.status === 'delivered' ? new Date() : null,
        delivery_status: w.status,
      }
    });
  }
  console.log(`✅ Created ${waData.length} WhatsApp message logs`);

  console.log('\n🎉 Seeding complete! CocoFresh database is ready.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
