import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Package, Users } from 'lucide-react';

export default function Relatorios() {
  return (
    <PageLayout title="Relatórios" subtitle="Análise de vendas">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <DollarSign size={24} className="text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Total Vendas</p>
            <p className="text-xl font-bold text-foreground">R$ 2.540</p>
          </Card>
          
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <Package size={24} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Cartelas Vendidas</p>
            <p className="text-xl font-bold text-foreground">127</p>
          </Card>
          
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <Users size={24} className="text-warning mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Vendedores Ativos</p>
            <p className="text-xl font-bold text-foreground">2</p>
          </Card>
          
          <Card className="p-4 text-center shadow-[var(--shadow-card)]">
            <TrendingUp size={24} className="text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Taxa Conversão</p>
            <p className="text-xl font-bold text-foreground">76%</p>
          </Card>
        </div>
        
        <Card className="p-4 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold text-foreground mb-3">Vendas por Vendedor</h3>
          <div className="space-y-3">
            {[
              { nome: 'João Silva', vendas: 85, percentual: 68 },
              { nome: 'Maria Santos', vendas: 42, percentual: 32 },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.nome}</span>
                  <span className="text-sm text-muted-foreground">{item.vendas} cartelas</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-primary-glow h-2 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentual}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}