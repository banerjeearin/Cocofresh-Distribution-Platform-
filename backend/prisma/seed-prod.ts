// Production seed — only seeds CoconutGrade master data.
// Idempotent: safe to run on every deploy.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Running production seed...');

  // Upsert grades — idempotent
  const grades = [
    { id: 'grade-a', label: 'Grade-A', price_per_unit: 70 },
    { id: 'grade-b', label: 'Grade-B', price_per_unit: 55 },
  ];

  for (const grade of grades) {
    const result = await prisma.coconutGrade.upsert({
      where:  { id: grade.id },
      update: { label: grade.label, price_per_unit: grade.price_per_unit, is_active: true },
      create: { id: grade.id, label: grade.label, price_per_unit: grade.price_per_unit, is_active: true },
    });
    console.log(`  ✅ Grade: ${result.label} @ Rs. ${result.price_per_unit}`);
  }

  console.log('✅ Production seed complete.');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
