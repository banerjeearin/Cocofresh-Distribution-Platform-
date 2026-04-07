import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { DeliveryService } from '../services/DeliveryService';

export const deliveryRoutes: FastifyPluginAsyncZod = async (app) => {

  // GET deliveries for a given date (defaults to today)
  // ?date=2026-04-05
  app.get(
    '/',
    {
      schema: {
        querystring: z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() })
      }
    },
    async (request, reply) => {
      const { date } = request.query as { date?: string };
      const data = await DeliveryService.getDeliveries(date);
      return reply.send(data);
    }
  );

  // PATCH :id — mark a single slot as delivered or skipped
  app.patch(
    '/:id',
    {
      schema: {
        params: z.object({ id: z.string() }),
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
      try {
        const updated = await DeliveryService.markSlot(id, action, marked_by, qty_delivered);
        return reply.send(updated);
      } catch (e: any) {
        return reply.status(400).send({ error: e.message });
      }
    }
  );

  // POST /bulk — mark all pending slots (or specific IDs) as delivered in one transaction
  app.post(
    '/bulk',
    {
      schema: {
        body: z.object({
          slot_ids:  z.array(z.string()).optional(),
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
