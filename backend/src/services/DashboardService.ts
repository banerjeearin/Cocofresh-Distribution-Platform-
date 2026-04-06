import { prisma } from '../server';

export class DashboardService {
  static async getStats() {
    const totalCustomers = await prisma.customer.count();
    
    // Fallback if empty db
    if (totalCustomers === 0) {
      return {
        customers: {
          total: 0,
          active: 0,
          paused: 0,
          churned: 0
        },
        deliveries: {
          today_total: 0,
          today_done: 0
        },
        revenue: {
          mtd_collected: 0,
          outstanding: 0,
          overdue: 0
        },
        trends: {
          week: []
        }
      };
    }

    const active = await prisma.customer.count({ where: { status: 'active' } });
    const paused = await prisma.customer.count({ where: { status: 'paused' } });
    const churned = await prisma.customer.count({ where: { status: 'churned' } });

    // Since we don't have robust seeding yet, we'll return zeroes for dynamic operations
    // so the UI can at least render the React Query map successfully
    return {
      customers: {
        total: totalCustomers,
        active,
        paused,
        churned
      },
      deliveries: {
        today_total: 0,
        today_done: 0
      },
      revenue: {
        mtd_collected: 0,
        outstanding: 0,
        overdue: 0
      },
      trends: {
        week: []
      }
    };
  }
}
