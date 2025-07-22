import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <PageLayout title="Bingo Vibe Sales" subtitle="Painel de controle">
      <div className="space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <Target size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Bingos Ativos</p>
            <p className="text-2xl font-bold text-foreground">3</p>
          </Card>
          
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <Users size={24} className="text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Vendedores</p>
            <p className="text-2xl font-bold text-foreground">12</p>
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
                <span className="text-sm font-medium">Vendas do Dia</span>
              </div>
              <Badge className="bg-success text-success-foreground">+127 cartelas</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
              <div className="flex items-center gap-3">
                <AlertCircle size={16} className="text-warning" />
                <span className="text-sm font-medium">Pedidos Pendentes</span>
              </div>
              <Badge className="bg-warning text-warning-foreground">3 pendentes</Badge>
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
