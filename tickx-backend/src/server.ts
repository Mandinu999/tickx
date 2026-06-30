import cors from '@fastify/cors';
import { ticketRoutes } from './routes/tickets';
import Fastify from 'fastify';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fastifyJwt from '@fastify/jwt';
import { authRoutes } from './routes/auth';
import { eventRoutes } from './routes/events';


const connectionString = process.env.DATABASE_URL || "postgresql://admin:supersecretpassword@localhost:5432/tickx_db?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

const fastify = Fastify({ logger: true });

fastify.register(cors, { 
  origin: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'] 
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'supersecret_jwt_key_123'
});

fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(eventRoutes, { prefix: '/api/events' });
fastify.register(ticketRoutes, { prefix: '/api/tickets' });

fastify.get('/health', async (request, reply) => {
  return { status: 'OK', message: 'TickX API is alive and kicking' };
});
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('TickX Backend Server running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();