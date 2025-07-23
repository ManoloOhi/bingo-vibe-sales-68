import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { DB_CONFIG } from '@/config/database';
import * as schema from './schema';

// Configurar a URL de conexão PostgreSQL para Vercel client
const connectionString = `postgresql://${DB_CONFIG.user}:${DB_CONFIG.password}@${DB_CONFIG.host}:${DB_CONFIG.port}/${DB_CONFIG.database}`;

// Configurar a conexão usando @vercel/postgres que funciona no browser
// Definir a connection string no global environment
(globalThis as any).process = (globalThis as any).process || {};
(globalThis as any).process.env = (globalThis as any).process.env || {};
(globalThis as any).process.env.POSTGRES_URL = connectionString;

// Instância do Drizzle ORM usando Vercel Postgres
export const db = drizzle(sql, { schema });

// Função para testar a conexão
export async function testConnection() {
  try {
    await sql`SELECT NOW()`;
    console.log('✅ Conexão com PostgreSQL estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com PostgreSQL:', error);
    return false;
  }
}