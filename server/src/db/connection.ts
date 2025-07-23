import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

const DB_CONFIG = {
  user: 'postgres',
  password: 'gZ33eBHvoNJAaXCd90SzYhZ1tehUT386MJe56PsfroixeVZeuk',
  host: 'vps.iaautomation-dev.com.br',
  port: 5432,
  database: 'bingo',
};

const pool = new Pool(DB_CONFIG);

export const db = drizzle(pool, { schema });

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