import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/Layout/PageLayout";
import { useRelatorioCompleto } from "@/hooks/useQueryData";
import { AlertTriangle, TrendingUp, Users, DollarSign, Package, Activity, Calendar, Target } from "lucide-react";

const formatCurrency = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(numValue);
};

const formatPercentage = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${numValue.toFixed(1)}%`;
};

export default function Relatorios() {
  const { data: relatorio, isLoading, error } = useRelatorioCompleto();

  const alertVariant = useMemo(() => {
    if (!relatorio?.observacoes?.alertas?.length) return "default";
    const alertas = relatorio.observacoes.alertas;
    if (alertas.some(a => a.includes("🚨"))) return "destructive";
    if (alertas.some(a => a.includes("⚠️"))) return "secondary";
    return "default";
  }, [relatorio]);

  if (isLoading) {
    return (
      <PageLayout title="Relatórios" subtitle="Análise completa do sistema">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px] mb-2" />
                <Skeleton className="h-3 w-[80px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </PageLayout>
    );
  }

  if (error || !relatorio) {
    return (
      <PageLayout title="Relatórios" subtitle="Análise completa do sistema">
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-muted-foreground">Erro ao carregar dados do relatório</p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  const { resumoGeral, bingos, vendedores, metricas, observacoes } = relatorio;

  return (
    <PageLayout title="Relatórios" subtitle={`Gerado em ${relatorio.dataGeracaoLocal}`}>
      <div className="space-y-6">
        {/* Alertas */}
        {observacoes.alertas?.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Alertas do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {observacoes.alertas.map((alerta, index) => (
                  <Badge key={index} variant={alertVariant} className="mr-2 mb-2">
                    {alerta}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Métricas Principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Arrecadado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumoGeral.financeiro.valorTotalArrecadado)}</div>
              <p className="text-xs text-muted-foreground">
                de {formatCurrency(resumoGeral.financeiro.valorTotalProjetado)} projetado
              </p>
              <Progress value={parseFloat(metricas.financeiro.percentualArrecadado)} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cartelas Vendidas</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumoGeral.cartelas.cartelasVendidas}</div>
              <p className="text-xs text-muted-foreground">
                {formatPercentage(resumoGeral.cartelas.percentualVendido)} do total
              </p>
              <Progress value={parseFloat(resumoGeral.cartelas.percentualVendido)} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumoGeral.sistema.vendedoresAtivos}</div>
              <p className="text-xs text-muted-foreground">
                de {resumoGeral.sistema.totalVendedores} cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPercentage(metricas.eficiencia.taxaConversaoGeral)}</div>
              <p className="text-xs text-muted-foreground">
                Eficiência geral do sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance por Bingo */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Bingo</CardTitle>
            <CardDescription>Status de vendas por evento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bingos.map((bingo) => (
                <Dialog key={bingo.id}>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium">{bingo.nome}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{bingo.estoque.vendido} vendidas</span>
                          <span>{bingo.estoque.pendente} pendentes</span>
                          <span>{formatCurrency(bingo.valores.valorArrecadado)} arrecadado</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatPercentage(bingo.percentuais.percentualVendido)}</div>
                        <Progress value={parseFloat(bingo.percentuais.percentualVendido)} className="w-24 mt-1" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{bingo.nome}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-medium mb-2">Estoque</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Disponível:</span>
                            <span>{bingo.estoque.disponivel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pendente:</span>
                            <span>{bingo.estoque.pendente}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vendido:</span>
                            <span>{bingo.estoque.vendido}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>{bingo.estoque.total}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Valores</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Arrecadado:</span>
                            <span>{formatCurrency(bingo.valores.valorArrecadado)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pendente:</span>
                            <span>{formatCurrency(bingo.valores.valorPendente)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Estoque:</span>
                            <span>{formatCurrency(bingo.valores.valorEstoque)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>{formatCurrency(bingo.valores.valorTotal)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance por Vendedor */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Vendedor</CardTitle>
            <CardDescription>Ranking de vendedores por eficiência</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendedores
                .sort((a, b) => parseFloat(b.performance.valorTotalVendido) - parseFloat(a.performance.valorTotalVendido))
                .map((vendedor) => (
                  <Dialog key={vendedor.id}>
                    <DialogTrigger asChild>
                      <div className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium">{vendedor.nome}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{vendedor.performance.cartelasVendidas} vendidas</span>
                            <span>{vendedor.performance.cartelasPendentes} pendentes</span>
                            <span>{formatCurrency(vendedor.performance.valorTotalVendido)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatPercentage(vendedor.performance.taxaConversao)}</div>
                          <Progress value={parseFloat(vendedor.performance.taxaConversao)} className="w-24 mt-1" />
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{vendedor.nome}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="font-medium mb-2">Atividade</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Pedidos:</span>
                              <span>{vendedor.performance.totalPedidos}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Bingos Participantes:</span>
                              <span>{vendedor.performance.bingosParticipantes}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Taxa Conversão:</span>
                              <span>{formatPercentage(vendedor.performance.taxaConversao)}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Cartelas</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Retiradas:</span>
                              <span>{vendedor.performance.cartelasRetiradas}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Vendidas:</span>
                              <span>{vendedor.performance.cartelasVendidas}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Devolvidas:</span>
                              <span>{vendedor.performance.cartelasDevolvidas}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Pendentes:</span>
                              <span>{vendedor.performance.cartelasPendentes}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Valor Total:</span>
                              <span>{formatCurrency(vendedor.performance.valorTotalVendido)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Eficiência */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Vendedor Mais Eficiente:</span>
                  <div className="font-medium">{metricas.eficiencia.vendedorMaisEficiente}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Bingo Mais Vendido:</span>
                  <div className="font-medium">{metricas.eficiencia.bingoMaisVendido}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Médias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Cartelas por Vendedor:</span>
                  <div className="font-medium">{metricas.eficiencia.mediaCartelasPorVendedor}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Valor Médio Cartela:</span>
                  <div className="font-medium">{formatCurrency(metricas.financeiro.valorMedioCartela)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Bingos Ativos:</span>
                  <div className="font-medium">{resumoGeral.sistema.bingosAtivos}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Pedidos Abertos:</span>
                  <div className="font-medium">{resumoGeral.sistema.pedidosAbertos}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}