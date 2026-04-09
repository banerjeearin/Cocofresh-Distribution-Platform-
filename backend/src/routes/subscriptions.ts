import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { SubscriptionService } from '../services/SubscriptionService';

export const subscriptionRoutes: FastifyPluginAsyncZod = async (app) => {

  // PATCH /api/subscriptions/:id/end-date — extend or shorten subscription end date
  app.patch(
    '/api/subscriptions/:id/end-date',
    {
      schema: {
        params: z.object({ id: z.string() }),
        body: z.object({
          new_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
        }),
      }
    },
    async (request, reply) => {
      const { id } = request.params;
      const { new_end_date } = request.body;

      try {
        const result = await SubscriptionService.updateEndDate(id, new_end_date);
        return reply.send(result);
      } catch (err: any) {
        const status = err.statusCode === 422 ? 422 : 500;
        return reply.status(status).send({ error: err.message });
      }
    }
  );
};
