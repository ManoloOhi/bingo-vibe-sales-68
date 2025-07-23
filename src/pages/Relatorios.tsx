import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Package, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { VendedorService } from '@/services/mockVendedorService';
import { PedidoService } from '@/services/mockPedidoService';
import { BingoService } from '@/services/mockBingoService';

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVendas: 0,
    cartelasVendidas: 0,
    vendedoresAtivos: 0,
    taxaConversao: 0
  });
  const [vendedoresStats, setVendedoresStats] = useState<Array<{
    nome: string;
    vendas: number;
    percentual: number;
  }>>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [vendedores, pedidos, bingos] = await Promise.all([
          VendedorService.list(),
          PedidoService.list(),
          BingoService.list()
        ]);

        // Calcular total de cartelas vendidas
        const totalCartelasVendidas = pedidos.reduce((total, p) => total + p.cartelasVendidas.length, 0);
        
        // Calcular total de cartelas retiradas
        const totalCartelasRetiradas = pedidos.reduce((total, p) => total + p.cartelasRetiradas.length, 0);
        
        // Calcular vendedores ativos (com pedidos abertos)
        const vendedoresComPedidos = new Set(pedidos.filter(p => p.status === 'aberto').map(p => p.vendedorId));
        
        // Calcular total de vendas (estimativa baseada em R$5 por cartela)
        const valorEstimadoPorCartela = 5;
        const totalVendas = totalCartelasVendidas * valorEstimadoPorCartela;
        
        // Calcular taxa de conversão
        const taxaConversao = totalCartelasRetiradas > 0 ? (totalCartelasVendidas / totalCartelasRetiradas) * 100 : 0;

        // Calcular stats por vendedor
        const vendedoresMap = vendedores.reduce((acc, v) => {
          acc[v.id] = v.nome;
          return acc;
        }, {} as Record<string, string>);

        const vendasPorVendedor = pedidos.reduce((acc, pedido) => {
          const vendedorNome = vendedoresMap[pedido.vendedorId] || 'Desconhecido';
          if (!acc[vendedorNome]) {
            acc[vendedorNome] = 0;
          }
          acc[vendedorNome] += pedido.cartelasVendidas.length;
          return acc;
        }, {} as Record<string, number>);

        const vendedoresStatsArray = Object.entries(vendasPorVendedor)
          .map(([nome, vendas]) => ({
            nome,
            vendas,
            percentual: totalCartelasVendidas > 0 ? (vendas / totalCartelasVendidas) * 100 : 0
          }))
          .sort((a, b) => b.vendas - a.vendas);

        setStats({
          totalVendas,
          cartelasVendidas: totalCartelasVendidas,
          vendedoresAtivos: vendedoresComPedidos.size,
          taxaConversao: Math.round(taxaConversao)
        });

        setVendedoresStats(vendedoresStatsArray);
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Relatórios" subtitle="Análise de vendas">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 text-center shadow-[var(--shadow-card)]">
                <div className="animate-pulse">
                  <div className="h-6 w-6 bg-muted rounded mx-auto mb-2"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Relatórios" subtitle="Análise de vendas">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <DollarSign size={24} className="text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Total Vendas</p>
            <p className="text-xl font-bold text-foreground">R$ {stats.totalVendas.toFixed(2)}</p>
          </Card>
          
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <Package size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Cartelas Vendidas</p>
            <p className="text-xl font-bold text-foreground">{stats.cartelasVendidas}</p>
          </Card>
          
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <Users size={24} className="text-warning mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Vendedores Ativos</p>
            <p className="text-xl font-bold text-foreground">{stats.vendedoresAtivos}</p>
          </Card>
          
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <TrendingUp size={24} className="text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Taxa Conversão</p>
            <p className="text-xl font-bold text-foreground">{stats.taxaConversao}%</p>
          </Card>
        </div>
        
        <Card className="p-4 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-foreground mb-3">Vendas por Vendedor</h3>
          <div className="space-y-3">
            {vendedoresStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhuma venda registrada ainda</p>
            ) : (
              vendedoresStats.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.nome}</span>
                    <span className="text-sm text-muted-foreground">{item.vendas} cartelas</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(item.percentual, 5)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}