import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { DeliveryService } from '../services/DeliveryService';

export const deliveryRoutes: FastifyPluginAsyncZod = async (app) => {
  // GET all today's deliveries
  app.get('/', async (request, reply) => {
    const data = await DeliveryService.getDeliveries();
    return reply.send(data);
  });

  // PATCH :id — mark a single slot as delivered or skipped
  app.patch(
    '/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: z.object({
          action:        z.enum(['delivered', 'skipped']),
          qty_delivered: z.number().int().min(0).optional(),
          marked_by:     z.string().optional(),
        })
      }
    },
    async (request, reply) => {
      const { id } = request.params;
      const { action, qty_delivered, marked_by } = request.body;
      const updated = await DeliveryService.markSlot(id, action, marked_by, qty_delivered);
      return reply.send(updated);
    }
  );

  // POST /bulk — mark all pending slots (or specific IDs) as delivered in one transaction
  app.post(
    '/bulk',
    {
      schema: {
        body: z.object({
          slot_ids:  z.array(z.string().uuid()).optional(), // if omitted, targets all today's pending
          action:    z.enum(['delivered', 'skipped']).default('delivered'),
          marked_by: z.string().optional(),
        })
      }
    },
    async (request, reply) => {
      const { slot_ids, action, marked_by } = request.body;
      const result = await DeliveryService.bulkMark(slot_ids, action, marked_by);
      return reply.send(result);
    }
  );
};
