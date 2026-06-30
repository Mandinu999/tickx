-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ORGANIZER';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "organizerId" TEXT;
