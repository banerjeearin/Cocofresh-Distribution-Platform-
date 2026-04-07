const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  // Check if already seeded
  const count = await prisma.coconutGrade.count();
  if (count > 0) {
    console.log('Grades already seeded. Count:', count);
    await prisma.$disconnect();
    return;
  }

  await prisma.coconutGrade.createMany({
    data: [
      { id: 'grade-a', label: 'Grade-A', price_per_unit: 70, is_active: true },
      { id: 'grade-b', label: 'Grade-B', price_per_unit: 55, is_active: true },
    ],
  });

  const all = await prisma.coconutGrade.findMany();
  console.log('Seeded grades:');
  all.forEach(g => console.log(`  ${g.label} — Rs. ${g.price_per_unit}`));
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
