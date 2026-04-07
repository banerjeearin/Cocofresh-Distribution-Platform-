import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { PaymentService } from '../services/PaymentService';

export const paymentRoutes: FastifyPluginAsyncZod = async (app) => {

  // GET — list all payments with stats + customer outstanding breakdown
  app.get('/', async (request, reply) => {
    const data = await PaymentService.getPayments();
    return reply.send(data);
  });

  // GET /receipt/:id — full receipt data for a specific payment
  app.get(
    '/receipt/:id',
    {
      schema: { params: z.object({ id: z.string().uuid() }) }
    },
    async (request, reply) => {
      const receipt = await PaymentService.getReceipt(request.params.id);
      return reply.send(receipt);
    }
  );

  // POST — record a new payment
  app.post(
    '/',
    {
      schema: {
        body: z.object({
          customer_id:   z.string().uuid(),
          amount:        z.number().positive(),
          payment_mode:  z.enum(['upi', 'cash', 'bank', 'advance', 'cod']),
          reference:     z.string().optional(),
          payment_date:  z.string().optional(),
        })
      }
    },
    async (request, reply) => {
      const payment = await PaymentService.recordPayment(request.body);
      return reply.status(201).send(payment);
    }
  );
};
