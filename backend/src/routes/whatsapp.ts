import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { WhatsAppService } from '../services/WhatsAppService';

export const whatsappRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/', async (request, reply) => {
    const data = await WhatsAppService.getMessages();
    return reply.send(data);
  });
};
