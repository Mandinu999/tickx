import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';

export async function authRoutes(fastify: FastifyInstance) {
  

  fastify.post('/register', async (request, reply) => {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.status(400).send({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
    });

    return reply.status(201).send({ message: 'User created successfully', userId: user.id });
  });

  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as any;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const token = fastify.jwt.sign({ userId: user.id, email: user.email }, { expiresIn: '2h' });

    return reply.send({ token });
  });

  fastify.put('/upgrade', {
    onRequest: [async (request, reply) => {
      try { 
        await request.jwtVerify(); 
      } catch (err: any) { 
        return reply.status(401).send({ error: `Token Error: ${err.message}` }); 
      }
    }]
  }, async (request, reply) => {
    const userToken = request.user as any;
    
    console.log("--- UPGRADE ROUTE HIT ---");
    console.log("Decoded Token:", userToken);

    const targetUserId = userToken.userId || userToken.id;

    if (!targetUserId) {
      return reply.status(400).send({ error: `CRITICAL: No ID found in token! Token looks like: ${JSON.stringify(userToken)}` });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { role: 'ORGANIZER' }
      });

      return reply.send({ 
        message: 'Congratulations! You are now an official Event Organizer.', 
        role: updatedUser.role 
      });
    } catch (error: any) {
      console.error("Database Error:", error); 
      return reply.status(500).send({ error: `DATABASE ERROR: ${error.message || 'Unknown database crash'}` });
    }
  });
}