import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DB_CONFIG } from '@/config/database';
import * as schema from './schema';

// Configuração da conexão PostgreSQL
const pool = new Pool({
  user: DB_CONFIG.user,
  password: DB_CONFIG.password,
  host: DB_CONFIG.host,
  port: DB_CONFIG.port,
  database: DB_CONFIG.database,
  ssl: false, // Ajustar conforme necessário
});

// Instância do Drizzle ORM
export const db = drizzle(pool, { schema });

// Função para testar a conexão
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexão com PostgreSQL estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com PostgreSQL:', error);
    return false;
  }
}