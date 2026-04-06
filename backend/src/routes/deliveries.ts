import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { DeliveryService } from '../services/DeliveryService';

export const deliveryRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', async (request, reply) => {
    const data = await DeliveryService.getDeliveries();
    return reply.send(data);
  });
};
