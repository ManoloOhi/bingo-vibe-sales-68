// Cópia do schema para o servidor API
import { pgTable, text, integer, timestamp, boolean, json, numeric } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Tabela de usuários (admin e usuários normais)
export const users = pgTable('users', {
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

// Tabela de bingos
export const bingos = pgTable('bingos', {
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

// Tabela de vendedores
export const vendedores = pgTable('vendedores', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  nome: text('nome').notNull(),
  email: text('email').notNull(),
  whatsapp: text('whatsapp').notNull(),
  ativo: boolean('ativo').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Tabela de pedidos
export const pedidos = pgTable('pedidos', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  bingoId: text('bingo_id').notNull().references(() => bingos.id),
  vendedorId: text('vendedor_id').notNull().references(() => vendedores.id),
  quantidade: integer('quantidade').notNull(),
  cartelasRetiradas: json('cartelas_retiradas').$type<number[]>().notNull().default([]),
  cartelasPendentes: json('cartelas_pendentes').$type<number[]>().notNull().default([]),
  cartelasVendidas: json('cartelas_vendidas').$type<number[]>().notNull().default([]),
  cartelasDevolvidas: json('cartelas_devolvidas').$type<number[]>().notNull().default([]),
  status: text('status', { enum: ['aberto', 'fechado', 'cancelado'] }).notNull().default('aberto'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});