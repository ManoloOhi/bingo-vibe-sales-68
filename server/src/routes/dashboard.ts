import { Router } from 'express';
import { db } from '../db/connection.js';
import { bingos, vendedores, pedidos } from '../db/schema.js';
import { eq, and, isNotNull } from 'drizzle-orm';

export const dashboardRoutes = Router();

// GET /api/dashboard/stats - Estatísticas do dashboard
dashboardRoutes.get('/stats', async (req, res) => {
  try {
    // Buscar todos os dados necessários
    const [bingosData, vendedoresData, pedidosData] = await Promise.all([
      db.select().from(bingos).where(eq(bingos.ativo, true)),
      db.select().from(vendedores).where(eq(vendedores.ativo, true)),
      db.select().from(pedidos)
    ]);

    // Calcular estatísticas usando a mesma lógica do frontend
    let totalRecebido = 0;
    let valorEsperado = 0;
    let cartelasVendidas = 0;
    let vendedoresAtivos = 0;

    // Criar mapa de vendedores para lookup rápido
    const vendedoresMap = vendedoresData.reduce((map, vendedor) => {
      map[vendedor.id] = vendedor;
      return map;
    }, {} as Record<string, any>);

    // Criar mapa de bingos para lookup rápido
    const bingosMap = bingosData.reduce((map, bingo) => {
      map[bingo.id] = bingo;
      return map;
    }, {} as Record<string, any>);

    // Contar vendedores ativos (com pedidos)
    const vendedoresComPedidos = new Set();

    // Calcular valores baseado nos pedidos
    pedidosData.forEach(pedido => {
      const bingo = bingosMap[pedido.bingoId];
      const vendedor = vendedoresMap[pedido.vendedorId];
      
      if (!bingo || !vendedor) return;

      // Adicionar vendedor à lista de ativos
      vendedoresComPedidos.add(pedido.vendedorId);

      // Calcular cartelas vendidas
      const cartelasVendidasPedido = (pedido.cartelasVendidas || []).length;
      cartelasVendidas += cartelasVendidasPedido;

      // Calcular valor recebido (apenas cartelas vendidas)
      totalRecebido += cartelasVendidasPedido * parseFloat(bingo.valorCartela);

      // Calcular valor esperado (total de cartelas do pedido)
      valorEsperado += parseInt(pedido.quantidadeCartelas) * parseFloat(bingo.valorCartela);
    });

    vendedoresAtivos = vendedoresComPedidos.size;

    // Calcular taxa de conversão
    const taxaConversao = valorEsperado > 0 ? (totalRecebido / valorEsperado) * 100 : 0;

    // Calcular vendas por vendedor
    const vendasPorVendedor = Array.from(vendedoresComPedidos).map(vendedorId => {
      const vendedor = vendedoresMap[vendedorId];
      const pedidosVendedor = pedidosData.filter(p => p.vendedorId === vendedorId);
      
      let valorVendedor = 0;
      let cartelasVendedor = 0;

      pedidosVendedor.forEach(pedido => {
        const bingo = bingosMap[pedido.bingoId];
        if (!bingo) return;

        const cartelasVendidasPedido = (pedido.cartelasVendidas || []).length;
        cartelasVendedor += cartelasVendidasPedido;
        valorVendedor += cartelasVendidasPedido * parseFloat(bingo.valorCartela);
      });

      const percentual = totalRecebido > 0 ? (valorVendedor / totalRecebido) * 100 : 0;

      return {
        vendedor: vendedor.nome,
        valor: valorVendedor,
        cartelas: cartelasVendedor,
        percentual
      };
    }).sort((a, b) => b.valor - a.valor);

    res.json({
      totalRecebido,
      valorEsperado,
      cartelasVendidas,
      vendedoresAtivos,
      taxaConversao,
      vendasPorVendedor
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard/relatorio-completo - Relatório completo
dashboardRoutes.get('/relatorio-completo', async (req, res) => {
  try {
    // Buscar dados das estatísticas
    const statsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/dashboard/stats`);
    const stats = await statsResponse.json();

    // Buscar dados adicionais para o relatório
    const [bingosData, vendedoresData, pedidosData] = await Promise.all([
      db.select().from(bingos).where(eq(bingos.ativo, true)),
      db.select().from(vendedores).where(eq(vendedores.ativo, true)),
      db.select().from(pedidos)
    ]);

    // Criar relatório detalhado de bingos
    const bingosRelatorio = bingosData.map(bingo => {
      const pedidosBingo = pedidosData.filter(p => p.bingoId === bingo.id);
      
      let cartelasVendidas = 0;
      let valorArrecadado = 0;
      let cartelasPendentes = 0;

      pedidosBingo.forEach(pedido => {
        const vendidas = (pedido.cartelasVendidas || []).length;
        const pendentes = (pedido.cartelasPendentes || []).length;
        
        cartelasVendidas += vendidas;
        cartelasPendentes += pendentes;
        valorArrecadado += vendidas * parseFloat(bingo.valorCartela);
      });

      const totalCartelas = parseInt(bingo.quantidadeCartelas);
      const cartelasDisponiveis = totalCartelas - cartelasVendidas - cartelasPendentes;

      return {
        ...bingo,
        cartelasVendidas,
        cartelasPendentes,
        cartelasDisponiveis,
        valorArrecadado,
        valorEsperado: totalCartelas * parseFloat(bingo.valorCartela)
      };
    });

    res.json({
      resumoGeral: stats,
      bingos: bingosRelatorio,
      vendedores: stats.vendasPorVendedor,
      alertas: [
        ...(stats.taxaConversao < 50 ? ['Taxa de conversão baixa'] : []),
        ...(stats.vendedoresAtivos < vendedoresData.length * 0.5 ? ['Muitos vendedores inativos'] : [])
      ]
    });
  } catch (error) {
    console.error('Erro ao gerar relatório completo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/dashboard/bingo/:id/relatorio - Relatório específico de um bingo
dashboardRoutes.get('/bingo/:id/relatorio', async (req, res) => {
  try {
    const bingoId = req.params.id;
    
    // Buscar dados do bingo
    const [bingo] = await db.select().from(bingos).where(eq(bingos.id, bingoId));
    if (!bingo) {
      return res.status(404).json({ error: 'Bingo não encontrado' });
    }

    // Buscar pedidos do bingo
    const [pedidosData, vendedoresData] = await Promise.all([
      db.select().from(pedidos).where(eq(pedidos.bingoId, bingoId)),
      db.select().from(vendedores).where(eq(vendedores.ativo, true))
    ]);

    // Criar mapa de vendedores
    const vendedoresMap = vendedoresData.reduce((map, vendedor) => {
      map[vendedor.id] = vendedor;
      return map;
    }, {} as Record<string, any>);

    // Calcular estatísticas do bingo
    let cartelasVendidas = 0;
    let cartelasPendentes = 0;
    let valorArrecadado = 0;

    const vendedoresDesempenho = pedidosData.map(pedido => {
      const vendedor = vendedoresMap[pedido.vendedorId];
      const vendidas = (pedido.cartelasVendidas || []).length;
      const pendentes = (pedido.cartelasPendentes || []).length;
      
      cartelasVendidas += vendidas;
      cartelasPendentes += pendentes;
      
      const valorVendedor = vendidas * parseFloat(bingo.valorCartela);
      valorArrecadado += valorVendedor;

      return {
        vendedor: vendedor?.nome || 'Vendedor não encontrado',
        cartelasVendidas: vendidas,
        cartelasPendentes: pendentes,
        cartelasRetiradas: (pedido.cartelasRetiradas || []).length,
        valorArrecadado: valorVendedor
      };
    });

    const totalCartelas = parseInt(bingo.quantidadeCartelas);
    const cartelasDisponiveis = totalCartelas - cartelasVendidas - cartelasPendentes;
    const valorEsperado = totalCartelas * parseFloat(bingo.valorCartela);

    res.json({
      bingo: {
        ...bingo,
        cartelasVendidas,
        cartelasPendentes,
        cartelasDisponiveis,
        valorArrecadado,
        valorEsperado
      },
      vendedores: vendedoresDesempenho,
      metricas: {
        taxaVenda: totalCartelas > 0 ? (cartelasVendidas / totalCartelas) * 100 : 0,
        taxaConversao: valorEsperado > 0 ? (valorArrecadado / valorEsperado) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório do bingo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});