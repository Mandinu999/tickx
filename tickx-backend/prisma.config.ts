import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://admin:supersecretpassword@localhost:5432/tickx_db?schema=public",
  },
}); 