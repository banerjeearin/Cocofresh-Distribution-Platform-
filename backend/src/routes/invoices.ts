import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { InvoiceService } from '../services/InvoiceService';

export const invoiceRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', async (request, reply) => {
    const data = await InvoiceService.getInvoices();
    return reply.send(data);
  });
};
