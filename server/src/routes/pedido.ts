import { Router } from 'express';
import { db } from '../db/connection.js';
import { pedidos } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const pedidoRoutes = Router();

// GET /api/pedidos
pedidoRoutes.get('/', async (req, res) => {
  try {
    const result = await db.select().from(pedidos);
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/pedidos
pedidoRoutes.post('/', async (req, res) => {
  try {
    const [result] = await db.insert(pedidos).values(req.body).returning();
    res.status(201).json(result);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/pedidos/:id
pedidoRoutes.put('/:id', async (req, res) => {
  try {
    const [result] = await db
      .update(pedidos)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(pedidos.id, req.params.id))
      .returning();
    
    if (!result) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json(result);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});