import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { CustomerService } from '../services/CustomerService';

export const customerRoutes: FastifyPluginAsyncZod = async (app) => {
  
  app.post(
    '/',
    {
      schema: {
        body: z.object({
          name: z.string(),
          mobile: z.string(),
          start_date: z.string(),
          payment_mode: z.enum(['advance', 'cod', 'cash', 'upi', 'bank_transfer']),
          address: z.object({
            label: z.string(),
            address_line: z.string(),
            landmark: z.string().optional(),
          }),
          plan: z.object({
            qty_per_day:    z.number().int().min(1).default(1),
            price_per_unit: z.number().positive(),
            grade_id:       z.string().optional(),
          })
        })
      }
    },
    async (request, reply) => {
      const customer = await CustomerService.createCustomer(request.body);
      return reply.status(201).send(customer);
    }
  );

  app.get('/', async (request, reply) => {
    const customers = await CustomerService.getCustomers();
    return reply.send(customers);
  });

  app.get(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid()
        })
      }
    },
    async (request, reply) => {
      const customer = await CustomerService.getCustomerById(request.params.id);
      if (!customer) {
        return reply.status(404).send({ error: 'Customer not found' });
      }
      return reply.send(customer);
    }
  );

  app.put(
    '/:id',
    {
      schema: {
        params: z.object({
          id: z.string().uuid()
        }),
        body: z.object({
          name: z.string().optional(),
          mobile: z.string().optional(),
          status: z.enum(['active', 'paused', 'churned']).optional()
        })
      }
    },
    async (request, reply) => {
      const customer = await CustomerService.updateCustomerStats(request.params.id, request.body);
      return reply.send(customer);
    }
  );
};
