import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TrendingUp, DollarSign, Package, Users, Loader2, Eye } from 'lucide-react';
import { useMemo } from 'react';
import { useBingos, useVendedores, usePedidos } from '@/hooks/useQueryData';

export default function Relatorios() {
  const { data: vendedores = [], isLoading: loadingVendedores } = useVendedores();
  const { data: pedidos = [], isLoading: loadingPedidos } = usePedidos();
  const { data: bingos = [], isLoading: loadingBingos } = useBingos();

  const loading = loadingVendedores || loadingPedidos || loadingBingos;

  const {
    stats,
    vendedoresStats,
    bingosDetalhes,
    vendasDetalhes,
    cartelasVendidasDetalhes,
    vendedoresDetalhes
  } = useMemo(() => {
    if (loading || !vendedores.length || !pedidos.length || !bingos.length) {
      return {
        stats: {
          totalRecebido: 0,
          valorEsperado: 0,
          cartelasVendidas: 0,
          vendedoresAtivos: 0,
          taxaConversao: 0
        },
        vendedoresStats: [],
        bingosDetalhes: [],
        vendasDetalhes: [],
        cartelasVendidasDetalhes: [],
        vendedoresDetalhes: []
      };
    }

    // Calcular total de cartelas vendidas
    const totalCartelasVendidas = pedidos.reduce((total, p) => total + p.cartelasVendidas.length, 0);
    
    // Calcular total de cartelas retiradas
    const totalCartelasRetiradas = pedidos.reduce((total, p) => total + p.cartelasRetiradas.length, 0);
    
    // Calcular vendedores ativos (com pedidos abertos)
    const vendedoresComPedidos = new Set(pedidos.filter(p => p.status === 'aberto').map(p => p.vendedorId));
    
    // Criar mapa de bingos para acesso rápido
    const bingosMap = bingos.reduce((acc, bingo) => {
      acc[bingo.id] = bingo;
      return acc;
    }, {} as Record<string, any>);
    
    // Calcular total recebido (cartelas vendidas x valor)
    const totalRecebido = pedidos.reduce((total, pedido) => {
      const bingo = bingosMap[pedido.bingoId];
      if (bingo && bingo.valorCartela) {
        const valorCartela = parseFloat(bingo.valorCartela);
        if (!isNaN(valorCartela) && valorCartela > 0) {
          return total + (pedido.cartelasVendidas.length * valorCartela);
        }
      }
      return total;
    }, 0);
    
    // Calcular valor esperado (valor da cartela x quantidade total de cartelas do bingo)
    const valorEsperado = bingos.reduce((total, bingo) => {
      if (bingo.valorCartela && bingo.quantidadeCartelas) {
        const valorCartela = parseFloat(bingo.valorCartela);
        if (!isNaN(valorCartela) && valorCartela > 0) {
          return total + (valorCartela * bingo.quantidadeCartelas);
        }
      }
      return total;
    }, 0);

        // Calcular detalhes de cada bingo para a modal
        const bingosDetalhesArray = bingos.map(bingo => {
          const valorCartela = parseFloat(bingo.valorCartela) || 0;
          return {
            nome: bingo.nome,
            valorEsperado: valorCartela * bingo.quantidadeCartelas,
            quantidadeCartelas: bingo.quantidadeCartelas
          };
        }).filter(item => item.valorEsperado > 0);

        // Calcular detalhes de vendas por bingo para a modal do Total Recebido
        const vendasDetalhesArray = bingos.map(bingo => {
          const valorCartela = parseFloat(bingo.valorCartela) || 0;
          // Somar cartelas vendidas deste bingo específico
          const cartelasVendidasBingo = pedidos
            .filter(p => p.bingoId === bingo.id)
            .reduce((total, p) => total + p.cartelasVendidas.length, 0);
          
          return {
            nome: bingo.nome,
            totalRecebido: valorCartela * cartelasVendidasBingo,
            cartelasVendidas: cartelasVendidasBingo
          };
        }).filter(item => item.cartelasVendidas > 0);
        
        // Calcular detalhes de cartelas vendidas por bingo para a modal
        const cartelasVendidasDetalhesArray = bingos.map(bingo => {
          const cartelasVendidasBingo = pedidos
            .filter(p => p.bingoId === bingo.id)
            .reduce((total, p) => total + p.cartelasVendidas.length, 0);
          
          return {
            nome: bingo.nome,
            cartelasVendidas: cartelasVendidasBingo
          };
        }).filter(item => item.cartelasVendidas > 0);

        // Calcular detalhes dos vendedores com seus bingos
        const vendedoresDetalhesArray = vendedores.map(vendedor => {
          // Encontrar pedidos abertos deste vendedor
          const pedidosVendedor = pedidos.filter(p => p.vendedorId === vendedor.id && p.status === 'aberto');
          
          // Extrair bingos únicos onde o vendedor tem cartelas
          const bingosVendedor = [...new Set(
            pedidosVendedor
              .filter(p => p.cartelasPendentes.length > 0 || p.cartelasRetiradas.length > 0)
              .map(p => bingosMap[p.bingoId]?.nome)
              .filter(Boolean)
          )];
          
          return {
            nome: vendedor.nome,
            bingos: bingosVendedor,
            status: bingosVendedor.length > 0 ? bingosVendedor.join(', ') : 'Livre'
          };
        });
        
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

        return {
          stats: {
            totalRecebido,
            valorEsperado,
            cartelasVendidas: totalCartelasVendidas,
            vendedoresAtivos: vendedoresComPedidos.size,
            taxaConversao: Math.round(taxaConversao)
          },
          vendedoresStats: vendedoresStatsArray,
          bingosDetalhes: bingosDetalhesArray,
          vendasDetalhes: vendasDetalhesArray,
          cartelasVendidasDetalhes: cartelasVendidasDetalhesArray,
          vendedoresDetalhes: vendedoresDetalhesArray
        };
  }, [vendedores, pedidos, bingos, loading]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
          <Dialog>
            <DialogTrigger asChild>
              <Card className="p-4 text-center shadow-[var(--shadow-card)] cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign size={24} className="text-success" />
                  <Eye size={16} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Total Recebido</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(stats.totalRecebido || 0)}</p>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Detalhes do Total Recebido</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Soma das cartelas vendidas multiplicadas pelo valor da cartela de cada bingo.
                </p>
                <div className="space-y-3">
                  {vendasDetalhes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nenhuma venda registrada ainda</p>
                  ) : (
                    vendasDetalhes.map((venda, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{venda.nome}</p>
                          <p className="text-xs text-muted-foreground">{venda.cartelasVendidas} cartelas vendidas</p>
                        </div>
                        <p className="font-bold text-foreground">{formatCurrency(venda.totalRecebido)}</p>
                      </div>
                    ))
                  )}
                </div>
                {vendasDetalhes.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">Total Recebido:</p>
                      <p className="text-lg font-bold text-foreground">{formatCurrency(stats.totalRecebido || 0)}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Card className="p-4 text-center shadow-[var(--shadow-card)] cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp size={24} className="text-warning" />
                  <Eye size={16} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Valor Esperado</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(stats.valorEsperado || 0)}</p>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Detalhes do Valor Esperado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Soma do total de cartelas de cada bingo multiplicado pelo valor da cartela.
                </p>
                <div className="space-y-3">
                  {bingosDetalhes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nenhum bingo cadastrado ainda</p>
                  ) : (
                    bingosDetalhes.map((bingo, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{bingo.nome}</p>
                          <p className="text-xs text-muted-foreground">{bingo.quantidadeCartelas} cartelas</p>
                        </div>
                        <p className="font-bold text-foreground">{formatCurrency(bingo.valorEsperado)}</p>
                      </div>
                    ))
                  )}
                </div>
                {bingosDetalhes.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">Total Esperado:</p>
                      <p className="text-lg font-bold text-foreground">{formatCurrency(stats.valorEsperado || 0)}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Card className="p-4 text-center shadow-[var(--shadow-card)] cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Package size={24} className="text-primary" />
                  <Eye size={16} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Cartelas Vendidas</p>
                <p className="text-xl font-bold text-foreground">{stats.cartelasVendidas}</p>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Detalhes das Cartelas Vendidas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Quantidade de cartelas vendidas por bingo.
                </p>
                <div className="space-y-3">
                  {cartelasVendidasDetalhes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nenhuma cartela vendida ainda</p>
                  ) : (
                    cartelasVendidasDetalhes.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{item.nome}</p>
                        </div>
                        <p className="font-bold text-foreground">{item.cartelasVendidas} cartelas</p>
                      </div>
                    ))
                  )}
                </div>
                {cartelasVendidasDetalhes.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">Total de Cartelas:</p>
                      <p className="text-lg font-bold text-foreground">{stats.cartelasVendidas}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Card className="p-4 text-center shadow-[var(--shadow-card)] cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users size={24} className="text-accent" />
                  <Eye size={16} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Vendedores Ativos</p>
                <p className="text-xl font-bold text-foreground">{stats.vendedoresAtivos}</p>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Detalhes dos Vendedores</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Lista de vendedores e seus bingos ativos. Vendedores sem cartelas aparecem como "Livre".
                </p>
                <div className="space-y-3">
                  {vendedoresDetalhes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nenhum vendedor cadastrado ainda</p>
                  ) : (
                    vendedoresDetalhes.map((vendedor, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{vendedor.nome}</p>
                        </div>
                        <p className={`font-bold text-sm ${vendedor.status === 'Livre' ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {vendedor.status}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                {vendedoresDetalhes.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">Total de Vendedores:</p>
                      <p className="text-lg font-bold text-foreground">{vendedoresDetalhes.length}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
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