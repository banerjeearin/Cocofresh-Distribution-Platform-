import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { DashboardService } from '../services/DashboardService';

export const dashboardRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', async (request, reply) => {
    const stats = await DashboardService.getStats();
    return reply.send(stats);
  });
};
