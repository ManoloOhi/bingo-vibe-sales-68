import { defineConfig } from 'drizzle-kit';
import { DB_CONFIG } from './src/config/database';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    user: DB_CONFIG.user,
    password: DB_CONFIG.password,
    host: DB_CONFIG.host,
    port: DB_CONFIG.port,
    database: DB_CONFIG.database,
    ssl: false,
  },
});