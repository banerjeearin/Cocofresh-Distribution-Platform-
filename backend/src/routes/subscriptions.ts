import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SubscriptionService } from '../services/SubscriptionService';

export async function subscriptionRoutes(app: FastifyInstance) {

  // PATCH /api/subscriptions/:id/end-date — extend or shorten subscription end date
  app.patch('/api/subscriptions/:id/end-date', {
    schema: {
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      body: z.object({
        new_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
      }),
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { new_end_date } = request.body as { new_end_date: string };

    try {
      const result = await SubscriptionService.updateEndDate(id, new_end_date);
      return reply.send(result);
    } catch (err: any) {
      const status = err.statusCode === 422 ? 422 : 500;
      return reply.status(status).send({ error: err.message });
    }
  });
}
