import { FastifyInstance } from 'fastify';
import { prisma } from '../server';

export async function ticketRoutes(fastify: FastifyInstance) {
  
  fastify.post('/reserve', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify(); 
      } catch (err) {
        return reply.status(401).send({ error: 'Unauthorized. Please log in first.' });
      }
    }]
  }, async (request, reply) => {
    const { eventId, seatNumber } = request.body as any;
    
    const user = request.user as any; 

    if (!eventId || !seatNumber) {
      return reply.status(400).send({ error: 'eventId and seatNumber are required' });
    }


    const lockResult = await prisma.ticket.updateMany({
      where: {
        eventId: eventId,
        seatNumber: seatNumber,
        status: 'AVAILABLE'
      },
      data: {
        status: 'LOCKED',
        lockedUntil: new Date(Date.now() + 5 * 60 * 1000) 
      }
    });

    if (lockResult.count === 0) {
      return reply.status(400).send({ 
        error: 'Too slow! This seat was just locked by someone else or does not exist.' 
      });
    }

    const lockedTicket = await prisma.ticket.findFirst({
      where: { eventId, seatNumber }
    });

    return reply.status(200).send({
      message: 'Seat successfully locked for 5 minutes!',
      ticket: lockedTicket,
      lockedForUser: user.email
    });
  });
  fastify.post('/checkout', {
    onRequest: [async (request, reply) => {
      try { await request.jwtVerify(); } 
      catch (err) { return reply.status(401).send({ error: 'Unauthorized. Please log in first.' }); }
    }]
  }, async (request, reply) => {
    const { eventId, seatNumber, paymentToken } = request.body as any;
    const user = request.user as any; 

    const ticket = await prisma.ticket.findFirst({
      where: { eventId, seatNumber }
    });

    if (!ticket) return reply.status(404).send({ error: 'Ticket not found' });

    const now = new Date();
    if (ticket.status === 'AVAILABLE' || (ticket.status === 'LOCKED' && ticket.lockedUntil && ticket.lockedUntil < now)) {
      return reply.status(400).send({ error: 'Ticket lock expired or not locked. You must reserve it first.' });
    }

    if (ticket.status === 'SOLD') {
      return reply.status(400).send({ error: 'This ticket has already been sold.' });
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        
        const soldTicket = await tx.ticket.update({
          where: { id: ticket.id },
          data: { 
            status: 'SOLD',
            lockedUntil: null 
          }
        });

        const booking = await tx.booking.create({
          data: {
            userId: user.userId, 
            eventId: eventId,
            ticketId: ticket.id,
            paymentStatus: 'COMPLETED'
          }
        });

        return { soldTicket, booking };
      });

      return reply.status(200).send({
        message: 'Payment successful! Ticket secured.',
        bookingId: result.booking.id
      });

    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ error: 'Transaction failed during checkout.' });
    }
  });

  fastify.get('/my-tickets', {
    onRequest: [async (request, reply) => {
      try { await request.jwtVerify(); } 
      catch (err) { return reply.status(401).send({ error: 'Unauthorized. Please log in first.' }); }
    }]
  }, async (request, reply) => {
    const user = request.user as any; 

    const targetUserId = user.userId || user.id;

    const bookings = await prisma.booking.findMany({
      where: { userId: targetUserId }, 
      include: {
        event: true,
        ticket: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return reply.status(200).send({ bookings });
  });
}