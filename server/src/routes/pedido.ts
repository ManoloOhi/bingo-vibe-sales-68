import { Router } from 'express';
import { db } from '../db/connection.js';
import { pedidos, vendedores } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyToken, type AuthenticatedRequest } from '../middleware/auth.js';

export const pedidoRoutes = Router();

// GET /api/pedidos
pedidoRoutes.get('/', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    let result;
    
    if (req.user?.tipo === 'admin') {
      // Admin vê todos os pedidos
      result = await db.select().from(pedidos);
    } else {
      // Usuários comuns veem apenas pedidos de seus vendedores
      result = await db
        .select({
          id: pedidos.id,
          bingoId: pedidos.bingoId,
          vendedorId: pedidos.vendedorId,
          quantidade: pedidos.quantidade,
          cartelasRetiradas: pedidos.cartelasRetiradas,
          cartelasPendentes: pedidos.cartelasPendentes,
          cartelasVendidas: pedidos.cartelasVendidas,
          cartelasDevolvidas: pedidos.cartelasDevolvidas,
          status: pedidos.status,
          createdAt: pedidos.createdAt,
          updatedAt: pedidos.updatedAt,
        })
        .from(pedidos)
        .innerJoin(vendedores, eq(pedidos.vendedorId, vendedores.id))
        .where(eq(vendedores.userId, req.user.userId));
    }
    
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/pedidos
pedidoRoutes.post('/', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Verificar se o vendedor pertence ao usuário (para usuários comuns)
    if (req.user?.tipo !== 'admin') {
      const [vendedor] = await db
        .select()
        .from(vendedores)
        .where(eq(vendedores.id, req.body.vendedorId));
      
      if (!vendedor || vendedor.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Você não pode criar pedidos para este vendedor' });
      }
    }
    
    const [result] = await db.insert(pedidos).values(req.body).returning();
    res.status(201).json(result);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/pedidos/:id
pedidoRoutes.put('/:id', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Verificar se o pedido pertence ao usuário (para usuários comuns)
    if (req.user?.tipo !== 'admin') {
      const [pedidoExistente] = await db
        .select()
        .from(pedidos)
        .innerJoin(vendedores, eq(pedidos.vendedorId, vendedores.id))
        .where(eq(pedidos.id, req.params.id));
      
      if (!pedidoExistente || pedidoExistente.vendedores.userId !== req.user.userId) {
        return res.status(403).json({ error: 'Você não pode editar este pedido' });
      }
    }
    
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