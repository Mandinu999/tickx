import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// 1. Define the connection directly
const connectionString = process.env.DATABASE_URL || "postgresql://admin:supersecretpassword@localhost:5432/tickx_db?schema=public";

// 2. Set up the Postgres connection pool
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 3. Inject the adapter into Prisma 7
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');
  
  // ... KEEP THE REST OF YOUR SEED CODE EXACTLY THE SAME BELOW THIS LINE ...

  // 1. Clear any old data to keep things fresh
  await prisma.booking.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create a massive dummy event
  const event = await prisma.event.create({
    data: {
      title: 'Mega Music Festival 2026',
      description: 'The ultimate high-concurrency ticket testing concert.',
      venueName: 'Madison Square Garden',
      eventDate: new Date('2026-12-25T20:00:00Z'),
      totalCapacity: 500,
    },
  });

  console.log(`🎉 Created Event: ${event.title} (ID: ${event.id})`);

  // 3. Generate 500 individual seats for this event
  console.log('🪑 Generating 500 seats...');
  const ticketsData = [];
  const rows = 20;
  const seatsPerRow = 25; // 20 rows * 25 seats = 500 total tickets

  for (let r = 1; r <= rows; r++) {
    for (let s = 1; s <= seatsPerRow; s++) {
      ticketsData.push({
        eventId: event.id,
        seatNumber: `Row ${r} - Seat ${s}`,
        price: 99.99,
        status: 'AVAILABLE' as const,
      });
    }
  }

  // Inject all 500 seats into Postgres in one high-speed database operation
  await prisma.ticket.createMany({
    data: ticketsData,
  });

  console.log('✅ Successfully seeded 500 available tickets!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });