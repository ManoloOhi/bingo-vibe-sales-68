import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { createId } from '@paralleldrive/cuid2';

// Schema simplificado para teste
import { pgTable, text, integer, timestamp, boolean, numeric } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

// Definir tabelas para teste
const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  whatsapp: text('whatsapp').notNull(),
  senha: text('senha').notNull(),
  tipo: text('tipo', { enum: ['admin', 'user'] }).notNull().default('user'),
  ativo: boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

const bingos = pgTable('bingos', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  nome: text('nome').notNull(),
  quantidadeCartelas: integer('quantidade_cartelas').notNull(),
  rangeInicio: integer('range_inicio').notNull(),
  rangeFim: integer('range_fim').notNull(),
  valorCartela: numeric('valor_cartela', { precision: 10, scale: 2 }).notNull(),
  dataBingo: timestamp('data_bingo').notNull(),
  ativo: boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

const vendedores = pgTable('vendedores', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  nome: text('nome').notNull(),
  email: text('email').notNull(),
  whatsapp: text('whatsapp').notNull(),
  ativo: boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Configuração do banco
const DB_CONFIG = {
  user: 'postgres',
  password: 'gZ33eBHvoNJAaXCd90SzYhZ1tehUT386MJe56PsfroixeVZeuk',
  host: 'vps.iaautomation-dev.com.br',
  port: 5432,
  database: 'bingo',
  ssl: false
};

console.log('🔧 Iniciando teste da API...');

async function testarAPI() {
  let pool;
  let db;
  
  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão com PostgreSQL...');
    pool = new Pool(DB_CONFIG);
    db = drizzle(pool, { schema: { users, bingos, vendedores } });
    
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as timestamp, version() as version');
    client.release();
    
    console.log('✅ Conexão estabelecida!');
    console.log('📅 Timestamp:', result.rows[0].timestamp);
    console.log('🗄️ PostgreSQL Version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    
    // 2. Testar criação de usuário
    console.log('\n2️⃣ Testando criação de usuário...');
    const novoUsuario = await db.insert(users).values({
      nome: 'Admin Teste',
      email: `admin.teste.${Date.now()}@bingo.com`,
      whatsapp: '(11) 99999-0000',
      senha: 'admin123',
      tipo: 'admin'
    }).returning();
    
    console.log('✅ Usuário criado:', {
      id: novoUsuario[0].id,
      nome: novoUsuario[0].nome,
      email: novoUsuario[0].email
    });
    
    // 3. Testar criação de bingo
    console.log('\n3️⃣ Testando criação de bingo...');
    const novoBingo = await db.insert(bingos).values({
      userId: novoUsuario[0].id,
      nome: 'Bingo Teste API',
      quantidadeCartelas: 50,
      rangeInicio: 1,
      rangeFim: 50,
      valorCartela: '10.00',
      dataBingo: new Date('2024-12-31'),
      ativo: true
    }).returning();
    
    console.log('✅ Bingo criado:', {
      id: novoBingo[0].id,
      nome: novoBingo[0].nome,
      cartelas: novoBingo[0].quantidadeCartelas,
      valor: novoBingo[0].valorCartela
    });
    
    // 4. Testar criação de vendedor
    console.log('\n4️⃣ Testando criação de vendedor...');
    const novoVendedor = await db.insert(vendedores).values({
      userId: novoUsuario[0].id,
      nome: 'João Vendedor Teste',
      email: `joao.teste.${Date.now()}@bingo.com`,
      whatsapp: '(11) 98888-7777',
      ativo: true
    }).returning();
    
    console.log('✅ Vendedor criado:', {
      id: novoVendedor[0].id,
      nome: novoVendedor[0].nome,
      email: novoVendedor[0].email
    });
    
    // 5. Testar consultas
    console.log('\n5️⃣ Testando consultas...');
    
    const bingosAtivos = await db.select().from(bingos).where(eq(bingos.ativo, true));
    console.log('📊 Bingos ativos encontrados:', bingosAtivos.length);
    
    const vendedoresAtivos = await db.select().from(vendedores).where(eq(vendedores.ativo, true));
    console.log('👥 Vendedores ativos encontrados:', vendedoresAtivos.length);
    
    const usuariosTotal = await db.select().from(users);
    console.log('🔑 Total de usuários:', usuariosTotal.length);
    
    // 6. Testar atualização
    console.log('\n6️⃣ Testando atualização...');
    const bingoAtualizado = await db
      .update(bingos)
      .set({ 
        nome: 'Bingo Teste API - ATUALIZADO',
        updatedAt: new Date()
      })
      .where(eq(bingos.id, novoBingo[0].id))
      .returning();
    
    console.log('✅ Bingo atualizado:', {
      id: bingoAtualizado[0].id,
      nomeAntigo: 'Bingo Teste API',
      nomeNovo: bingoAtualizado[0].nome
    });
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Conexão: OK');
    console.log('✅ Inserção: OK'); 
    console.log('✅ Consulta: OK');
    console.log('✅ Atualização: OK');
    console.log('\n🔥 API FUNCIONANDO PERFEITAMENTE!');
    
  } catch (error) {
    console.error('❌ ERRO no teste:', error);
    if (error instanceof Error) {
      console.error('📝 Mensagem:', error.message);
      console.error('📋 Stack:', error.stack);
    }
  } finally {
    if (pool) {
      await pool.end();
      console.log('\n🔌 Conexão com banco fechada.');
    }
  }
}

// Executar teste
testarAPI();