import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Users, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDashboardStats, useBingos, useVendedores, usePedidos } from '@/hooks/useQueryData';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para gerar últimas atividades baseadas nos dados reais
const getUltimasAtividades = (pedidos: any[], vendedores: { [key: string]: any }, bingos: { [key: string]: any }) => {
  const atividades: { texto: string; tempo: string; data: Date }[] = [];

  // Adicionar atividades de pedidos
  pedidos.forEach(pedido => {
    const vendedor = vendedores[pedido.vendedorId];
    const bingo = bingos[pedido.bingoId];
    
    if (vendedor && bingo) {
      // Atividade de criação do pedido
      atividades.push({
        texto: `${vendedor.nome} retirou ${pedido.quantidade} cartelas`,
        tempo: formatDistanceToNow(new Date(pedido.createdAt), { addSuffix: true, locale: ptBR }),
        data: new Date(pedido.createdAt)
      });

      // Atividades de vendas (se houver)
      const cartelasVendidas = pedido.cartelasVendidas || [];
      if (cartelasVendidas.length > 0) {
        atividades.push({
          texto: `${vendedor.nome} vendeu ${cartelasVendidas.length} cartelas`,
          tempo: formatDistanceToNow(new Date(pedido.updatedAt), { addSuffix: true, locale: ptBR }),
          data: new Date(pedido.updatedAt)
        });
      }
    }
  });

  // Adicionar atividades de bingos criados
  Object.values(bingos).forEach(bingo => {
    atividades.push({
      texto: `Bingo "${bingo.nome}" foi criado`,
      tempo: formatDistanceToNow(new Date(bingo.createdAt), { addSuffix: true, locale: ptBR }),
      data: new Date(bingo.createdAt)
    });
  });

  // Ordenar por data mais recente e pegar apenas as 3 mais recentes
  return atividades
    .sort((a, b) => b.data.getTime() - a.data.getTime())
    .slice(0, 3);
};

const Index = () => {
  const { data: dashboardStats, isLoading: loadingStats } = useDashboardStats();
  const { data: bingos, isLoading: loadingBingos } = useBingos();
  const { data: vendedores, isLoading: loadingVendedores } = useVendedores();
  const { data: pedidos, isLoading: loadingPedidos } = usePedidos();

  const loading = loadingStats || loadingBingos || loadingVendedores || loadingPedidos;

  // Criar mapas para atividades recentes
  const vendedoresMap = vendedores?.reduce((acc: any, v: any) => {
    acc[v.id] = v;
    return acc;
  }, {}) || {};

  const bingosMap = bingos?.reduce((acc: any, b: any) => {
    acc[b.id] = b;
    return acc;
  }, {}) || {};

  if (loading) {
    return (
      <PageLayout title="Bingo Vibe Sales" subtitle="Painel de controle">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 text-center shadow-[var(--shadow-card)]">
              <div className="animate-pulse">
                <div className="h-6 w-6 bg-muted rounded mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </Card>
            <Card className="p-4 text-center shadow-[var(--shadow-card)]">
              <div className="animate-pulse">
                <div className="h-6 w-6 bg-muted rounded mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </Card>
            <Card className="p-4 text-center shadow-[var(--shadow-card)]">
              <div className="animate-pulse">
                <div className="h-6 w-6 bg-muted rounded mx-auto mb-2"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Bingo Vibe Sales" subtitle="Painel de controle">
      <div className="space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <Target size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Bingos Ativos</p>
            <p className="text-2xl font-bold text-foreground">{dashboardStats?.bingosAtivos || 0}</p>
            <p className="text-xs text-muted-foreground">
              de {dashboardStats?.totalBingos || 0} total
            </p>
          </Card>
          
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <Users size={24} className="text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Vendedores Ativos</p>
            <p className="text-2xl font-bold text-foreground">{dashboardStats?.vendedoresAtivos || 0}</p>
            <p className="text-xs text-muted-foreground">
              de {dashboardStats?.totalVendedores || 0} total
            </p>
          </Card>
        </div>

        {/* Valor Total Arrecadado */}
        <Card className="p-4 text-center shadow-[var(--shadow-card)]">
          <DollarSign size={24} className="text-green-600 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Valor Arrecadado</p>
          <p className="text-3xl font-bold text-green-600">
            R$ {parseFloat(dashboardStats?.valorTotalArrecadado || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </Card>

        {/* Ações Rápidas */}
        <Card className="p-4 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-foreground mb-3">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/bingos">
              <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
                <Plus size={16} />
                Novo Bingo
              </Button>
            </Link>
            <Link to="/vendedores">
              <Button variant="outline" className="w-full">
                <Users size={16} />
                Vendedor
              </Button>
            </Link>
          </div>
        </Card>

        {/* Status Atual */}
        <Card className="p-4 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-foreground mb-3">Status Atual</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center gap-3">
                <TrendingUp size={16} className="text-success" />
                <span className="text-sm font-medium">Pedidos Abertos</span>
              </div>
              <Badge className="bg-success text-success-foreground">{dashboardStats?.pedidosAbertos || 0} abertos</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
              <div className="flex items-center gap-3">
                <AlertCircle size={16} className="text-warning" />
                <span className="text-sm font-medium">Total Pedidos</span>
              </div>
              <Badge className="bg-warning text-warning-foreground">{dashboardStats?.totalPedidos || 0} total</Badge>
            </div>
          </div>
        </Card>

        {/* Últimas Atividades */}
        <Card className="p-4 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-foreground mb-3">Últimas Atividades</h3>
          <div className="space-y-2 text-sm">
            {getUltimasAtividades(pedidos || [], vendedoresMap, bingosMap).map((atividade, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">{atividade.texto}</span>
                <span className="text-xs text-muted-foreground">{atividade.tempo}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Index;
