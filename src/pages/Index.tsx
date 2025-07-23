import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BingoService } from '@/services/mockBingoService';
import { VendedorService } from '@/services/mockVendedorService';
import { PedidoService } from '@/services/mockPedidoService';
import { initializeMockData } from '@/services/initMockData';

const Index = () => {
  const [stats, setStats] = useState({
    bingosAtivos: 0,
    vendedores: 0,
    pedidosPendentes: 0,
    cartelasVendidas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Inicializar dados de exemplo se necessário
        await initializeMockData();

        console.log('Index: Carregando dados dos serviços...');
        const [bingos, vendedores, pedidos] = await Promise.all([
          BingoService.list(),
          VendedorService.list(),
          PedidoService.list()
        ]);

        console.log('Index: Dados carregados:', {
          bingos: bingos.length,
          vendedores: vendedores.length,
          pedidos: pedidos.length
        });

        const pedidosPendentes = pedidos.filter(p => p.status === 'aberto').length;
        const cartelasVendidas = pedidos.reduce((total, p) => total + p.cartelasVendidas.length, 0);

        const newStats = {
          bingosAtivos: bingos.length,
          vendedores: vendedores.length,
          pedidosPendentes,
          cartelasVendidas
        };

        console.log('Index: Stats calculadas:', newStats);
        setStats(newStats);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

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
            <p className="text-2xl font-bold text-foreground">{stats.bingosAtivos}</p>
          </Card>
          
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <Users size={24} className="text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Vendedores</p>
            <p className="text-2xl font-bold text-foreground">{stats.vendedores}</p>
          </Card>
        </div>

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
                <span className="text-sm font-medium">Cartelas Vendidas</span>
              </div>
              <Badge className="bg-success text-success-foreground">+{stats.cartelasVendidas} cartelas</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
              <div className="flex items-center gap-3">
                <AlertCircle size={16} className="text-warning" />
                <span className="text-sm font-medium">Pedidos Pendentes</span>
              </div>
              <Badge className="bg-warning text-warning-foreground">{stats.pedidosPendentes} pendentes</Badge>
            </div>
          </div>
        </Card>

        {/* Últimas Atividades */}
        <Card className="p-4 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-foreground mb-3">Últimas Atividades</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">João vendeu 25 cartelas</span>
              <span className="text-xs text-muted-foreground">2h atrás</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Maria retirou pedido #002</span>
              <span className="text-xs text-muted-foreground">4h atrás</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Novo bingo criado</span>
              <span className="text-xs text-muted-foreground">1d atrás</span>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Index;
