import { Router } from 'express';
import { db } from '../db/connection.js';
import { bingos } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const bingoRoutes = Router();

// GET /api/bingos - Listar todos os bingos
bingoRoutes.get('/', async (req, res) => {
  try {
    const result = await db.select().from(bingos).where(eq(bingos.ativo, true));
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar bingos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/bingos/:id - Buscar bingo por ID
bingoRoutes.get('/:id', async (req, res) => {
  try {
    const [result] = await db.select().from(bingos).where(eq(bingos.id, req.params.id));
    if (!result) {
      return res.status(404).json({ error: 'Bingo não encontrado' });
    }
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar bingo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/bingos - Criar novo bingo
bingoRoutes.post('/', async (req, res) => {
  try {
    const [result] = await db.insert(bingos).values(req.body).returning();
    res.status(201).json(result);
  } catch (error) {
    console.error('Erro ao criar bingo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/bingos/:id - Atualizar bingo
bingoRoutes.put('/:id', async (req, res) => {
  try {
    const [result] = await db
      .update(bingos)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(bingos.id, req.params.id))
      .returning();
    
    if (!result) {
      return res.status(404).json({ error: 'Bingo não encontrado' });
    }
    res.json(result);
  } catch (error) {
    console.error('Erro ao atualizar bingo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// DELETE /api/bingos/:id - Deletar bingo
bingoRoutes.delete('/:id', async (req, res) => {
  try {
    const result = await db.delete(bingos).where(eq(bingos.id, req.params.id));
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Bingo não encontrado' });
    }
    res.json({ message: 'Bingo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar bingo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});