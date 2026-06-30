import { FastifyInstance } from 'fastify';
import { prisma } from '../server';

export async function eventRoutes(fastify: FastifyInstance) {
  
  fastify.get('/', async (request, reply) => {
    try {
      const events = await prisma.event.findMany({
        orderBy: { eventDate: 'asc' },
        include: {
          user: {
            select: {
              email: true,
              role: true
            }
          }
        }
      });
      return reply.send({ events });
    } catch (error) {
      return reply.status(500).send({ error: 'Failed to fetch events' });
    }
  });

  fastify.get('/:eventId/seats', async (request, reply) => {
    const { eventId } = request.params as { eventId: string };

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return reply.status(404).send({ error: 'Event not found' });
    }

    const seats = await prisma.ticket.findMany({
      where: { eventId: eventId },
      orderBy: { seatNumber: 'asc' } 
    });

    return reply.send({ 
      event: event.title,
      totalSeats: seats.length,
      seats 
    });
  });
  fastify.post('/', {
    onRequest: [async (request, reply) => {
      try { 
        await request.jwtVerify(); 
      } catch (err) { 
        return reply.status(401).send({ error: 'Unauthorized. Please log in.' }); 
      }
    }]
  }, async (request, reply) => {
    const { title, description, venueName, eventDate, price, rows, seatsPerRow } = request.body as any;
    const userToken = request.user as any;

    try {
      const targetUserId = userToken.userId || userToken.id;
      const user = await prisma.user.findUnique({ where: { id: targetUserId } });
      
      if (!user || (user.role !== 'ADMIN' && user.role !== 'ORGANIZER')) {
        return reply.status(403).send({ 
          error: 'Forbidden: You do not have permissions to host events. Upgrade to an Organizer account first.' 
        });
      }

      const numRows = parseInt(rows) || 20;
      const numSeatsPerRow = parseInt(seatsPerRow) || 25;
      const ticketPrice = parseFloat(price) || 99.99;
      const totalCapacity = numRows * numSeatsPerRow;

      const event = await prisma.event.create({
        data: {
          title,
          description,
          venueName,
          eventDate: new Date(eventDate),
          totalCapacity: totalCapacity, 
          organizerId: user.id 
        }
      });

      const ticketsData = [];
      for (let r = 1; r <= numRows; r++) {
        for (let s = 1; s <= numSeatsPerRow; s++) {
          const formattedRow = r.toString().padStart(2, '0');
          const formattedSeat = s.toString().padStart(2, '0');

          ticketsData.push({
            eventId: event.id,
            seatNumber: `Row ${formattedRow} - Seat ${formattedSeat}`,
            price: ticketPrice, 
            status: 'AVAILABLE' as const,
          });
        }
      }

      await prisma.ticket.createMany({ data: ticketsData });

      return reply.status(201).send({ 
        message: `Event and ${totalCapacity} stadium seats successfully spawned!`, 
        event 
      });
    } catch (error: any) {
      console.error("Failed to create event:", error);
      return reply.status(500).send({ error: 'Internal server error occurred while building the map.' });
    }
  });
}