import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Package, Users, Loader2, Eye, AlertTriangle, Activity, Target, TrendingDown } from 'lucide-react';
import { useRelatorioCompleto } from '@/hooks/useQueryData';
import ExportReportForm from '@/components/forms/ExportReportForm';

export default function Relatorios() {
  const { data: relatorio, isLoading: loading, error } = useRelatorioCompleto();

  // ... keep existing code (formatCurrency function)

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue || 0);
  };

  if (error) {
    return (
      <PageLayout title="Relatórios" subtitle="Análise de vendas">
        <Card className="p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar relatório</h3>
          <p className="text-muted-foreground">Não foi possível carregar os dados do relatório completo.</p>
        </Card>
      </PageLayout>
    );
  }

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
          <Card className="p-4">
            <div className="animate-pulse h-8 bg-muted rounded w-full"></div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!relatorio) {
    return (
      <PageLayout title="Relatórios" subtitle="Análise de vendas">
        <Card className="p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
          <p className="text-muted-foreground">Não há dados suficientes para gerar o relatório.</p>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Relatórios" subtitle="Análise completa do sistema">
      <div className="space-y-6">
        {/* Header com informações de geração */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Relatório Completo</h3>
              <p className="text-sm text-muted-foreground">
                Gerado em: {relatorio.dataGeracaoLocal}
              </p>
            </div>
            <ExportReportForm />
          </div>
        </Card>

        {/* Alertas do Sistema */}
        {relatorio.observacoes.alertas.length > 0 && (
          <Card className="p-4 border-warning/20 bg-warning/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-warning-foreground mb-2">Alertas do Sistema</h4>
                <div className="space-y-1">
                  {relatorio.observacoes.alertas.map((alerta, i) => (
                    <Badge key={i} variant="outline" className="mr-2 mb-1 text-xs">
                      {alerta}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Métricas Principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-sm text-muted-foreground">Arrecadado</p>
            <p className="text-xl font-bold">
              {formatCurrency(relatorio.resumoGeral.financeiro.valorTotalArrecadado)}
            </p>
          </Card>
          
          <Card className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Projetado</p>
            <p className="text-xl font-bold">
              {formatCurrency(relatorio.resumoGeral.financeiro.valorTotalProjetado)}
            </p>
          </Card>
          
          <Card className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-accent" />
            <p className="text-sm text-muted-foreground">Cartelas Vendidas</p>
            <p className="text-xl font-bold">
              {relatorio.resumoGeral.cartelas.cartelasVendidas}
            </p>
          </Card>
          
          <Card className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-secondary" />
            <p className="text-sm text-muted-foreground">Vendedores Ativos</p>
            <p className="text-xl font-bold">
              {relatorio.resumoGeral.sistema.vendedoresAtivos}
            </p>
          </Card>
        </div>

        {/* Métricas de Eficiência */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Métricas de Eficiência
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Vendedor Mais Eficiente</p>
              <p className="font-bold text-lg">{relatorio.metricas.eficiencia.vendedorMaisEficiente}</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Bingo Mais Vendido</p>
              <p className="font-bold text-lg">{relatorio.metricas.eficiencia.bingoMaisVendido}</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">Taxa Conversão Geral</p>
              <p className="font-bold text-lg">{relatorio.metricas.eficiencia.taxaConversaoGeral}%</p>
            </div>
          </div>
        </Card>

        {/* Performance dos Bingos */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance dos Bingos
          </h3>
          <div className="space-y-3">
            {relatorio.bingos.map((bingo, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{bingo.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      {bingo.quantidadeCartelas} cartelas • {formatCurrency(bingo.valorCartela)} cada
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(bingo.valores.valorArrecadado)}</p>
                    <p className="text-sm text-muted-foreground">arrecadado</p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-success">
                    {bingo.estoque.vendido} vendidas ({bingo.percentuais.percentualVendido}%)
                  </span>
                  <span className="text-warning">
                    {bingo.estoque.pendente} pendentes ({bingo.percentuais.percentualPendente}%)
                  </span>
                  <span className="text-muted-foreground">
                    {bingo.estoque.disponivel} disponíveis ({bingo.percentuais.percentualDisponivel}%)
                  </span>
                </div>
                <Progress 
                  value={parseFloat(bingo.percentuais.percentualVendido)} 
                  className="mt-2 h-2"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Performance dos Vendedores */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Performance dos Vendedores
          </h3>
          <div className="space-y-3">
            {relatorio.vendedores.map((vendedor, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{vendedor.nome}</h4>
                    <p className="text-sm text-muted-foreground">
                      {vendedor.performance.totalPedidos} pedidos • {vendedor.performance.bingosParticipantes} bingos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(vendedor.performance.valorTotalVendido)}</p>
                    <p className="text-sm text-muted-foreground">vendido</p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-success">
                    {vendedor.performance.cartelasVendidas} vendidas
                  </span>
                  <span className="text-warning">
                    {vendedor.performance.cartelasRetiradas} retiradas
                  </span>
                  <span className="text-secondary">
                    {vendedor.performance.cartelasDevolvidas} devolvidas
                  </span>
                  <span className="text-primary">
                    {vendedor.performance.taxaConversao}% conversão
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Resumo Final */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5">
          <h3 className="font-semibold mb-3">Resumo Executivo</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{relatorio.resumoGeral.sistema.totalBingos}</p>
              <p className="text-sm text-muted-foreground">Bingos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">{relatorio.resumoGeral.sistema.totalVendedores}</p>
              <p className="text-sm text-muted-foreground">Vendedores</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent">{relatorio.resumoGeral.cartelas.totalCartelas}</p>
              <p className="text-sm text-muted-foreground">Cartelas Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{relatorio.resumoGeral.cartelas.percentualVendido}%</p>
              <p className="text-sm text-muted-foreground">Vendidas</p>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}