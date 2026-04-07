import { FastifyInstance } from 'fastify';
import { GradeService } from '../services/GradeService';

export async function gradeRoutes(app: FastifyInstance) {

  // GET /api/grades — list all active grades
  app.get('/api/grades', async (req, reply) => {
    const { all } = req.query as { all?: string };
    const grades = await GradeService.listGrades(all === 'true');
    return reply.send({ grades });
  });

  // POST /api/grades — create a new grade
  app.post('/api/grades', async (req, reply) => {
    const { label, price_per_unit } = req.body as { label: string; price_per_unit: number };
    if (!label || price_per_unit == null) return reply.status(400).send({ error: 'label and price_per_unit required' });
    const grade = await GradeService.createGrade(label, price_per_unit);
    return reply.status(201).send({ grade });
  });

  // PATCH /api/grades/:id — update label or price
  app.patch('/api/grades/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const data = req.body as { label?: string; price_per_unit?: number };
    const grade = await GradeService.updateGrade(id, data);
    return reply.send({ grade });
  });

  // DELETE /api/grades/:id — deactivate
  app.delete('/api/grades/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const grade = await GradeService.deactivateGrade(id);
    return reply.send({ grade, message: 'Grade deactivated' });
  });

  // PATCH /api/subscriptions/:id/grade — set subscription default grade
  app.patch('/api/subscriptions/:id/grade', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { grade_id } = req.body as { grade_id: string };
    if (!grade_id) return reply.status(400).send({ error: 'grade_id required' });
    const plan = await GradeService.setSubscriptionGrade(id, grade_id);
    return reply.send({ plan, message: 'Subscription grade updated' });
  });

  // PATCH /api/delivery-slots/:id/grade — override grade for a specific slot
  app.patch('/api/delivery-slots/:id/grade', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { grade_id } = req.body as { grade_id: string };
    if (!grade_id) return reply.status(400).send({ error: 'grade_id required' });
    const slot = await GradeService.setSlotGrade(id, grade_id);
    return reply.send({ slot, message: 'Slot grade updated' });
  });

  // GET /api/subscriptions/:id/grade-history
  app.get('/api/subscriptions/:id/grade-history', async (req, reply) => {
    const { id } = req.params as { id: string };
    const logs = await GradeService.getGradeHistory(id);
    return reply.send({ logs });
  });
}
