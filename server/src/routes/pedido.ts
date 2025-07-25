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

// GET /api/pedidos/:id
pedidoRoutes.get('/:id', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user?.tipo === 'admin') {
      // Admin pode ver qualquer pedido
      const [result] = await db
        .select()
        .from(pedidos)
        .where(eq(pedidos.id, req.params.id));
      
      if (!result) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      res.json(result);
    } else {
      // Usuários comuns veem apenas pedidos de seus vendedores
      const [result] = await db
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
        .where(eq(pedidos.id, req.params.id))
        .where(eq(vendedores.userId, req.user.userId));
      
      if (!result) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      res.json(result);
    }
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
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

// DELETE /api/pedidos/:id
pedidoRoutes.delete('/:id', verifyToken, async (req: AuthenticatedRequest, res) => {
  try {
    // Primeiro, buscar o pedido para verificar permissões e cartelas pendentes
    let pedidoExistente;
    
    if (req.user?.tipo === 'admin') {
      [pedidoExistente] = await db
        .select()
        .from(pedidos)
        .where(eq(pedidos.id, req.params.id));
    } else {
      // Usuários comuns só podem deletar pedidos de seus vendedores
      [pedidoExistente] = await db
        .select()
        .from(pedidos)
        .innerJoin(vendedores, eq(pedidos.vendedorId, vendedores.id))
        .where(eq(pedidos.id, req.params.id))
        .where(eq(vendedores.userId, req.user.userId));
    }

    if (!pedidoExistente) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Verificar se há cartelas pendentes
    const cartelasPendentes = pedidoExistente.cartelasPendentes || [];
    
    if (cartelasPendentes.length > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir pedido com cartelas pendentes',
        details: {
          cartelasPendentes: cartelasPendentes.length,
          cartelas: cartelasPendentes,
          observacao: 'Todas as cartelas retiradas devem estar vendidas ou devolvidas antes da exclusão'
        }
      });
    }

    // Deletar o pedido
    await db
      .delete(pedidos)
      .where(eq(pedidos.id, req.params.id));

    res.json({ message: 'Pedido excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});