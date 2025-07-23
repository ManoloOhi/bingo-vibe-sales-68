import { Router } from 'express';
import { db } from '../db/connection.js';
import { vendedores } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const vendedorRoutes = Router();

// GET /api/vendedores
vendedorRoutes.get('/', async (req, res) => {
  try {
    const result = await db.select().from(vendedores).where(eq(vendedores.ativo, true));
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar vendedores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/vendedores
vendedorRoutes.post('/', async (req, res) => {
  try {
    const [result] = await db.insert(vendedores).values(req.body).returning();
    res.status(201).json(result);
  } catch (error) {
    console.error('Erro ao criar vendedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/vendedores/:id
vendedorRoutes.put('/:id', async (req, res) => {
  try {
    const [result] = await db
      .update(vendedores)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(vendedores.id, req.params.id))
      .returning();
    
    if (!result) {
      return res.status(404).json({ error: 'Vendedor não encontrado' });
    }
    res.json(result);
  } catch (error) {
    console.error('Erro ao atualizar vendedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});