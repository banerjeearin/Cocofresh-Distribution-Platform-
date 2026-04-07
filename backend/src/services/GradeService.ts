import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GradeService = {

  // ── List all grades ──────────────────────────────────────────────────────
  async listGrades(includeInactive = false) {
    return prisma.coconutGrade.findMany({
      where: includeInactive ? {} : { is_active: true },
      orderBy: { price_per_unit: 'desc' },
    });
  },

  // ── Create a new grade ───────────────────────────────────────────────────
  async createGrade(label: string, price_per_unit: number) {
    return prisma.coconutGrade.create({
      data: { label, price_per_unit, is_active: true },
    });
  },

  // ── Update a grade ───────────────────────────────────────────────────────
  async updateGrade(id: string, data: { label?: string; price_per_unit?: number }) {
    return prisma.coconutGrade.update({ where: { id }, data });
  },

  // ── Deactivate a grade ───────────────────────────────────────────────────
  async deactivateGrade(id: string) {
    return prisma.coconutGrade.update({ where: { id }, data: { is_active: false } });
  },

  // ── Set subscription default grade (with history log) ───────────────────
  async setSubscriptionGrade(subscriptionId: string, gradeId: string) {
    // Get current plan's grade
    const plan = await prisma.subscriptionPlan.findFirst({
      where: { subscription_id: subscriptionId },
      orderBy: { effective_from: 'desc' },
    });

    const fromGradeId = plan?.grade_id ?? null;

    // Update latest plan's grade_id
    if (plan) {
      await prisma.subscriptionPlan.update({
        where: { id: plan.id },
        data: { grade_id: gradeId },
      });
    }

    // Log the change (only if it's actually different)
    if (fromGradeId && fromGradeId !== gradeId) {
      await prisma.gradeChangeLog.create({
        data: {
          subscription_id: subscriptionId,
          from_grade_id: fromGradeId,
          to_grade_id: gradeId,
          changed_by: 'admin',
        },
      });
    }

    return prisma.subscriptionPlan.findFirst({
      where: { subscription_id: subscriptionId },
      orderBy: { effective_from: 'desc' },
      include: { grade: true },
    });
  },

  // ── Set per-slot grade override (with history log) ───────────────────────
  async setSlotGrade(slotId: string, gradeId: string) {
    const slot = await prisma.deliverySlot.findUnique({ where: { id: slotId } });
    if (!slot) throw new Error('Slot not found');

    const fromGradeId = slot.grade_id;

    const updated = await prisma.deliverySlot.update({
      where: { id: slotId },
      data: { grade_id: gradeId },
      include: { grade: true },
    });

    // Log if different
    if (fromGradeId && fromGradeId !== gradeId) {
      await prisma.gradeChangeLog.create({
        data: {
          subscription_id: slot.subscription_id,
          slot_id: slotId,
          from_grade_id: fromGradeId,
          to_grade_id: gradeId,
          changed_by: 'admin',
        },
      });
    }

    return updated;
  },

  // ── Get grade change history for a subscription ──────────────────────────
  async getGradeHistory(subscriptionId: string) {
    return prisma.gradeChangeLog.findMany({
      where: { subscription_id: subscriptionId },
      include: { from_grade: true, to_grade: true },
      orderBy: { changed_at: 'desc' },
    });
  },
};
