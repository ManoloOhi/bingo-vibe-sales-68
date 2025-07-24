import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, Users, Loader2, DollarSign, Eye, TrendingUp } from 'lucide-react';
import { useBingos, useVendasBingo } from '@/hooks/useQueryData';
import { CreateBingoForm } from '@/components/forms/CreateBingoForm';
import { EditBingoForm } from '@/components/forms/EditBingoForm';
import { useNavigate } from 'react-router-dom';

interface BingoCardProps {
  bingo: any;
  onBingoUpdated: () => void;
}

function BingoCard({ bingo, onBingoUpdated }: BingoCardProps) {
  const navigate = useNavigate();
  const { data: vendasData, isLoading: vendasLoading } = useVendasBingo(bingo.id);

  if (vendasLoading) {
    return (
      <Card className="p-4 shadow-[var(--shadow-card)]">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
            <div className="h-12 bg-muted rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const percentualVendido = vendasData ? parseFloat(vendasData.resumo.percentualVendido) : 0;
  const totalVendidas = vendasData ? vendasData.resumo.totalCartelasVendidas : 0;
  const valorTotal = vendasData ? vendasData.resumo.valorTotalVendas : "0.00";
  const totalVendas = vendasData ? vendasData.resumo.totalVendas : 0;
  const restantes = bingo.quantidadeCartelas - totalVendidas;

  // Determinar badge de performance
  const getPerformanceBadge = () => {
    if (percentualVendido >= 80) return { text: "🔥 Hot", variant: "default" as const };
    if (percentualVendido >= 50) return { text: "📈 Ativo", variant: "secondary" as const };
    if (percentualVendido >= 20) return { text: "🚀 Crescendo", variant: "outline" as const };
    return { text: "🐌 Devagar", variant: "outline" as const };
  };

  const performanceBadge = getPerformanceBadge();

  return (
    <Card className="p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{bingo.nome}</h3>
            <p className="text-sm text-muted-foreground">
              Cartelas: {String(bingo.rangeInicio).padStart(3, '0')}-{String(bingo.rangeFim).padStart(3, '0')}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(bingo.dataBingo).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={performanceBadge.variant}>{performanceBadge.text}</Badge>
            <Badge variant="secondary" className={bingo.ativo ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
              {bingo.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso de vendas</span>
            <span className="font-medium">{percentualVendido.toFixed(1)}%</span>
          </div>
          <Progress value={percentualVendido} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <Target size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-semibold">{bingo.quantidadeCartelas}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users size={16} className="text-success" />
            <span className="text-xs text-muted-foreground">Vendidas</span>
            <span className="font-semibold">{totalVendidas}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <DollarSign size={16} className="text-warning" />
            <span className="text-xs text-muted-foreground">Arrecadado</span>
            <span className="font-semibold text-xs">R$ {valorTotal}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <TrendingUp size={16} className="text-accent" />
            <span className="text-xs text-muted-foreground">Vendas</span>
            <span className="font-semibold">{totalVendas}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(`/bingos/${bingo.id}/detalhes`)}
            className="flex-1"
          >
            <Eye size={16} className="mr-2" />
            Ver Detalhes
          </Button>
          <EditBingoForm bingo={bingo} onBingoUpdated={onBingoUpdated} />
        </div>
      </div>
    </Card>
  );
}

export default function Bingos() {
  const { data: bingos, isLoading, refetch } = useBingos();

  const handleBingoCreated = () => {
    refetch();
  };

  const handleBingoUpdated = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <PageLayout title="Bingos" subtitle="Gerencie seus eventos">
        <div className="space-y-4">
          <Button disabled className="w-full bg-gradient-to-r from-primary to-primary-glow">
            <Loader2 size={18} className="animate-spin" />
            Carregando...
          </Button>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 shadow-[var(--shadow-card)]">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-12 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Bingos" subtitle="Gerencie seus eventos">
      <div className="space-y-4">
        <CreateBingoForm onBingoCreated={handleBingoCreated} />
        
        <div className="space-y-3">
          {!bingos || bingos.length === 0 ? (
            <Card className="p-6 text-center shadow-[var(--shadow-card)]">
              <p className="text-muted-foreground">Nenhum bingo encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro bingo para começar</p>
            </Card>
          ) : (
            bingos.map((bingo) => (
              <BingoCard 
                key={bingo.id} 
                bingo={bingo} 
                onBingoUpdated={handleBingoUpdated} 
              />
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}