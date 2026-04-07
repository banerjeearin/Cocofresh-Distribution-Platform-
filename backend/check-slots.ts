import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log('Today midnight (local):', today.toISOString());

  const total = await prisma.deliverySlot.count();
  console.log('Total DeliverySlots in DB:', total);

  // Count by scheduled_date directly
  const todayExact = await prisma.deliverySlot.count({ where: { scheduled_date: today } });
  console.log('Slots matching today exact:', todayExact);

  // Get most recent 10 distinct dates
  const recent = await prisma.deliverySlot.findMany({
    take: 10,
    orderBy: { scheduled_date: 'desc' },
    distinct: ['scheduled_date', 'time_band'],
    select: { scheduled_date: true, time_band: true, status: true, subscription: { select: { customer: { select: { name: true } } } } }
  });
  console.log('Most recent slot entries:');
  recent.forEach(s => console.log(` ${new Date(s.scheduled_date).toISOString()} | ${s.time_band} | ${s.status} | ${s.subscription.customer.name}`));

  await prisma.$disconnect();
}
main().catch(console.error);
