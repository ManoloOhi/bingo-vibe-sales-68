import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    user: 'postgres',
    password: 'gZ33eBHvoNJAaXCd90SzYhZ1tehUT386MJe56PsfroixeVZeuk',
    host: 'vps.iaautomation-dev.com.br',
    port: 5432,
    database: 'bingo',
    ssl: false,
  },
});