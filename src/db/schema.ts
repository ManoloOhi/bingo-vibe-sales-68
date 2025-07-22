import { pgTable, text, integer, timestamp, boolean, json, uuid, varchar, numeric } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Tabela de usuários (admin e usuários normais)
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  whatsapp: text('whatsapp').notNull(),
  senha: text('senha').notNull(), // Hash da senha
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

// Tabela de vendas
export const vendas = pgTable('vendas', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  pedidoId: text('pedido_id').notNull().references(() => pedidos.id),
  cartelasVendidas: json('cartelas_vendidas').$type<number[]>().notNull(),
  dataPagamento: timestamp('data_pagamento').notNull(),
  valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
  observacoes: text('observacoes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Tabela de log de movimentações das cartelas
export const cartelasLog = pgTable('cartelas_log', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  bingoId: text('bingo_id').notNull().references(() => bingos.id),
  pedidoId: text('pedido_id').references(() => pedidos.id),
  vendaId: text('venda_id').references(() => vendas.id),
  cartela: integer('cartela').notNull(),
  acao: text('acao', { 
    enum: ['retirada', 'venda', 'devolucao', 'cancelamento'] 
  }).notNull(),
  dataAcao: timestamp('data_acao').notNull().defaultNow(),
  observacoes: text('observacoes'),
});

// Tipos TypeScript para facilitar o uso
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Bingo = typeof bingos.$inferSelect;
export type NewBingo = typeof bingos.$inferInsert;
export type Vendedor = typeof vendedores.$inferSelect;
export type NewVendedor = typeof vendedores.$inferInsert;
export type Pedido = typeof pedidos.$inferSelect;
export type NewPedido = typeof pedidos.$inferInsert;
export type Venda = typeof vendas.$inferSelect;
export type NewVenda = typeof vendas.$inferInsert;
export type CartelaLog = typeof cartelasLog.$inferSelect;
export type NewCartelaLog = typeof cartelasLog.$inferInsert;