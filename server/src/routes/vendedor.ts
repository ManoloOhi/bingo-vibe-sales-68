import { Router } from 'express';
import { db } from '../db/connection.js';
import { vendedores } from '../db/schema.js';
import { eq, and, count } from 'drizzle-orm';

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

// DELETE /api/vendedores/:id
vendedorRoutes.delete('/:id', async (req, res) => {
  try {
    // Verificar se o vendedor tem pedidos ativos
    const { pedidos } = await import('../db/schema.js');
    const [pedidosCount] = await db
      .select({ count: count() })
      .from(pedidos)
      .where(and(
        eq(pedidos.vendedorId, req.params.id),
        eq(pedidos.status, 'aberto')
      ));

    if (pedidosCount.count > 0) {
      return res.status(400).json({
        error: 'Não é possível desativar vendedor com pedidos ativos',
        pedidosAtivos: pedidosCount.count,
        message: `O vendedor possui ${pedidosCount.count} pedido(s) ativo(s). Finalize ou cancele os pedidos antes de desativar o vendedor.`
      });
    }

    // Inativar o vendedor
    const [result] = await db
      .update(vendedores)
      .set({ ativo: false, updatedAt: new Date() })
      .where(eq(vendedores.id, req.params.id))
      .returning();
    
    if (!result) {
      return res.status(404).json({ error: 'Vendedor não encontrado' });
    }
    
    res.json({ message: 'Vendedor inativado com sucesso', vendedor: result });
  } catch (error) {
    console.error('Erro ao inativar vendedor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});