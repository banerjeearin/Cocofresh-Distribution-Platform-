import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { WhatsAppService } from '../services/WhatsAppService';

export const whatsappRoutes: FastifyPluginAsyncZod = async (app) => {

  // GET — list all messages with stats
  app.get('/', async (request, reply) => {
    const data = await WhatsAppService.getMessages();
    return reply.send(data);
  });

  // POST — create a new WA message log entry
  app.post(
    '/',
    {
      schema: {
        body: z.object({
          customer_id:   z.string().uuid(),
          template_type: z.enum(['invoice', 'welcome', 'delivery', 'skip', 'payment', 'renewal']),
          message_body:  z.string().optional(),
        })
      }
    },
    async (request, reply) => {
      const message = await WhatsAppService.logMessage(request.body);
      return reply.status(201).send(message);
    }
  );

  // PATCH /:id/sent — mark a message as sent
  app.patch(
    '/:id/sent',
    {
      schema: {
        params: z.object({ id: z.string().uuid() })
      }
    },
    async (request, reply) => {
      const message = await WhatsAppService.markSent(request.params.id);
      return reply.send(message);
    }
  );
};
