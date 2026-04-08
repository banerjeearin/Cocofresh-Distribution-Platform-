import { FastifyInstance } from 'fastify';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Normalize allowed admin emails to lowercase for comparison
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean);

export async function authRoutes(app: FastifyInstance) {

  // POST /api/auth/google — verify Google credential and issue our JWT
  app.post('/api/auth/google', async (request, reply) => {
    const { credential } = request.body as { credential?: string };

    if (!credential) {
      return reply.status(400).send({ error: 'Google credential is required' });
    }

    try {
      // Verify the Google ID token against our client ID
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return reply.status(401).send({ error: 'Invalid Google token' });
      }

      const email   = payload.email.toLowerCase();
      const name    = payload.name    || email;
      const picture = payload.picture || '';

      // Reject anyone not on the admin allowlist
      if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email)) {
        return reply.status(403).send({
          error: `Access denied. ${payload.email} is not authorised as an admin.`,
        });
      }

      // Issue a 12-hour JWT containing identity claims
      const token = app.jwt.sign(
        { email, name, picture },
        { expiresIn: '12h' }
      );

      return reply.send({
        token,
        user: { email, name, picture },
      });

    } catch (err: any) {
      app.log.error(err);
      return reply.status(401).send({ error: 'Google token verification failed' });
    }
  });

  // GET /api/auth/me — return current user info from JWT
  app.get('/api/auth/me', {
    preHandler: async (request, reply) => {
      try { await request.jwtVerify(); }
      catch { return reply.status(401).send({ error: 'Unauthorized' }); }
    }
  }, async (request, reply) => {
    return reply.send({ user: (request as any).user });
  });
}
