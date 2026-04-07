import { FastifyInstance } from 'fastify';
import { HolidayService } from '../services/HolidayService';

export async function holidayRoutes(app: FastifyInstance) {

  // GET /api/holidays/:customerId — list all holidays for a customer
  app.get('/api/holidays/:customerId', async (req, reply) => {
    const { customerId } = req.params as { customerId: string };
    const holidays = await HolidayService.getHolidays(customerId);
    return reply.send({ holidays });
  });

  // POST /api/holidays — add a single holiday
  app.post('/api/holidays', async (req, reply) => {
    const { customer_id, subscription_id, date, reason } = req.body as {
      customer_id: string;
      subscription_id: string;
      date: string;
      reason?: string;
    };
    if (!customer_id || !subscription_id || !date) {
      return reply.status(400).send({ error: 'customer_id, subscription_id, and date are required' });
    }
    try {
      const result = await HolidayService.addHoliday(customer_id, subscription_id, date, reason);
      return reply.status(201).send(result);
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });

  // POST /api/holidays/range — add a date range of holidays
  app.post('/api/holidays/range', async (req, reply) => {
    const { customer_id, subscription_id, start_date, end_date, reason } = req.body as {
      customer_id: string;
      subscription_id: string;
      start_date: string;
      end_date: string;
      reason?: string;
    };
    if (!customer_id || !subscription_id || !start_date || !end_date) {
      return reply.status(400).send({ error: 'customer_id, subscription_id, start_date, and end_date are required' });
    }
    if (new Date(end_date) < new Date(start_date)) {
      return reply.status(400).send({ error: 'end_date must be on or after start_date' });
    }
    try {
      const result = await HolidayService.addHolidayRange(customer_id, subscription_id, start_date, end_date, reason);
      return reply.status(201).send(result);
    } catch (e: any) {
      return reply.status(400).send({ error: e.message });
    }
  });

  // DELETE /api/holidays/:id — remove a holiday
  app.delete('/api/holidays/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      const result = await HolidayService.removeHoliday(id);
      return reply.send(result);
    } catch (e: any) {
      return reply.status(404).send({ error: e.message });
    }
  });
}
