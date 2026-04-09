import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { SubscriptionService } from '../services/SubscriptionService';

const dateBody = z.object({
  new_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

const startDateBody = z.object({
  new_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export const subscriptionRoutes: FastifyPluginAsyncZod = async (app) => {

  // PATCH /api/subscriptions/:id/end-date
  app.patch(
    '/api/subscriptions/:id/end-date',
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: dateBody,
      }
    },
    async (request, reply) => {
      try {
        const result = await SubscriptionService.updateEndDate(request.params.id, request.body.new_end_date);
        return reply.send(result);
      } catch (err: any) {
        return reply.status(err.statusCode === 422 ? 422 : 500).send({ error: err.message });
      }
    }
  );

  // PATCH /api/subscriptions/:id/start-date
  app.patch(
    '/api/subscriptions/:id/start-date',
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: startDateBody,
      }
    },
    async (request, reply) => {
      try {
        const result = await SubscriptionService.updateStartDate(request.params.id, request.body.new_start_date);
        return reply.send(result);
      } catch (err: any) {
        return reply.status(err.statusCode === 422 ? 422 : 500).send({ error: err.message });
      }
    }
  );
};
