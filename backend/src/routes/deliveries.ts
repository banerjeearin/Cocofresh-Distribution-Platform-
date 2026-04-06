import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { DeliveryService } from '../services/DeliveryService';

export const deliveryRoutes: FastifyPluginAsyncZod = async (app) => {
  // GET all today's deliveries
  app.get('/', async (request, reply) => {
    const data = await DeliveryService.getDeliveries();
    return reply.send(data);
  });

  // PATCH :id — mark a slot as delivered or skipped
  app.patch(
    '/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: z.object({
          action: z.enum(['delivered', 'skipped']),
          marked_by: z.string().optional(),
        })
      }
    },
    async (request, reply) => {
      const { id } = request.params;
      const { action, marked_by } = request.body;
      const updated = await DeliveryService.markSlot(id, action, marked_by);
      return reply.send(updated);
    }
  );
};
