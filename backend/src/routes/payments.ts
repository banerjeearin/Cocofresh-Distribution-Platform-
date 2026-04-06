import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { PaymentService } from '../services/PaymentService';

export const paymentRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', async (request, reply) => {
    const data = await PaymentService.getPayments();
    return reply.send(data);
  });
};
