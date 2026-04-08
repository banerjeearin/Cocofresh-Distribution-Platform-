// ─── Force IST timezone BEFORE any Date objects are created ─────────────────
process.env.TZ = 'Asia/Kolkata';

import 'dotenv/config';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { customerRoutes } from './routes/customers';
import { dashboardRoutes } from './routes/dashboard';
import { deliveryRoutes } from './routes/deliveries';
import { paymentRoutes } from './routes/payments';
import { invoiceRoutes } from './routes/invoices';
import { whatsappRoutes } from './routes/whatsapp';
import { gradeRoutes } from './routes/grades';
import { holidayRoutes } from './routes/holidays';
import { authRoutes } from './routes/auth';

const server = Fastify({
  logger: true
});

export const prisma = new PrismaClient();

async function start() {
  try {
    // CORS: restrict to frontend origin in production, or allow all in dev
    const corsOrigin: string | boolean = process.env.CORS_ORIGIN || true;

    await server.register(cors, {
      origin: corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  JWT_SECRET env var not set in production — using insecure default');
    }
    await server.register(jwt, {
      secret: jwtSecret || 'cocofresh-dev-secret-change-in-prod'
    });

    server.setValidatorCompiler(validatorCompiler);
    server.setSerializerCompiler(serializerCompiler);

    // ── Public routes (no JWT required) ────────────────────────────────────
    server.register(authRoutes);

    // ── Global JWT guard — protects everything except /health and /api/auth/* ──
    const PUBLIC_PREFIXES = ['/health', '/api/auth/'];
    server.addHook('onRequest', async (request, reply) => {
      const url = request.url.split('?')[0];
      if (PUBLIC_PREFIXES.some(p => url === p || url.startsWith(p))) return;
      try {
        await request.jwtVerify();
      } catch {
        return reply.status(401).send({ error: 'Unauthorized — please log in' });
      }
    });

    // ── Protected routes ───────────────────────────────────────────────────
    server.register(customerRoutes, { prefix: '/api/customers' });
    server.register(dashboardRoutes, { prefix: '/api/dashboard' });
    server.register(deliveryRoutes, { prefix: '/api/deliveries' });
    server.register(paymentRoutes, { prefix: '/api/payments' });
    server.register(invoiceRoutes, { prefix: '/api/invoices' });
    server.register(whatsappRoutes, { prefix: '/api/whatsapp' });
    server.register(gradeRoutes);
    server.register(holidayRoutes);

    server.get('/health', async (request, reply) => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
