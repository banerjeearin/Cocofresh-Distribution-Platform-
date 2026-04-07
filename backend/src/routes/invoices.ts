import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { InvoiceService } from '../services/InvoiceService';

export const invoiceRoutes: FastifyPluginAsyncZod = async (app) => {
  // GET /invoices?year=2026&month=4
  app.get(
    '/',
    {
      schema: {
        querystring: z.object({
          year:  z.coerce.number().int().min(2020).max(2099).optional(),
          month: z.coerce.number().int().min(1).max(12).optional(),
        })
      }
    },
    async (request, reply) => {
      const { year, month } = request.query;
      const data = await InvoiceService.getInvoices(year, month);
      return reply.send(data);
    }
  );
};
