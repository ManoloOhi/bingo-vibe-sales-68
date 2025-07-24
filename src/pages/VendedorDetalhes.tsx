import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone, Mail, DollarSign, TrendingUp, Package, Calendar, ArrowLeft, Trophy } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useVendedor, useVendasVendedor } from '@/hooks/useQueryData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function VendedorDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: vendedor, isLoading: loadingVendedor } = useVendedor(id!);
  const { data: vendasData, isLoading: loadingVendas } = useVendasVendedor(id!);

  if (loadingVendedor || loadingVendas) {
    return (
      <PageLayout 
        title="Detalhes do Vendedor" 
        subtitle="Carregando informações..."
      >
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/vendedores')}
            className="mb-4 p-2 h-auto"
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar para Vendedores
          </Button>
          <Card className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-56" />
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!vendedor || !vendasData) {
    return (
      <PageLayout 
        title="Vendedor não encontrado" 
        subtitle="O vendedor solicitado não existe"
      >
        <Card className="p-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/vendedores')}
            className="mb-4 p-2 h-auto"
          >
            <ArrowLeft size={20} className="mr-2" />
            Voltar para Vendedores
          </Button>
          <p className="text-muted-foreground">Vendedor não encontrado</p>
          <Button asChild className="mt-4">
            <Link to="/vendedores">Voltar para Vendedores</Link>
          </Button>
        </Card>
      </PageLayout>
    );
  }

  const { resumo, vendas } = vendasData;
  
  const getPerformanceLevel = () => {
    const valor = parseFloat(resumo.valorTotalVendas);
    if (valor >= 500) return { text: "Top Seller", color: "bg-success text-success-foreground", icon: Trophy };
    if (valor >= 200) return { text: "Vendedor Experiente", color: "bg-primary text-primary-foreground", icon: TrendingUp };
    if (valor > 0) return { text: "Vendedor Iniciante", color: "bg-secondary text-secondary-foreground", icon: Package };
    return { text: "Sem vendas", color: "bg-muted text-muted-foreground", icon: Package };
  };

  const performance = getPerformanceLevel();
  const PerformanceIcon = performance.icon;

  return (
    <PageLayout 
      title={vendedor.nome} 
      subtitle="Detalhes e histórico de vendas"
    >
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/vendedores')}
          className="mb-4 p-2 h-auto"
        >
          <ArrowLeft size={20} className="mr-2" />
          Voltar para Vendedores
        </Button>
        
        {/* Informações do Vendedor */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-semibold text-foreground">{vendedor.nome}</h2>
                <Badge className={performance.color}>
                  <PerformanceIcon size={14} className="mr-1" />
                  {performance.text}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone size={16} />
                  <span>{vendedor.whatsapp}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail size={16} />
                  <span>{vendedor.email}</span>
                </div>
              </div>
            </div>
            <Badge variant={vendedor.ativo ? "default" : "secondary"}>
              {vendedor.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </Card>

        {/* Métricas Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <DollarSign className="text-success" />
              <span className="text-sm font-medium text-muted-foreground">Total Vendido</span>
            </div>
            <p className="text-xl font-bold text-success text-center">R$ {resumo.valorTotalVendas}</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Cartelas Vendidas</span>
            </div>
            <p className="text-xl font-bold text-foreground text-center">{resumo.totalCartelasVendidas}</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Package className="text-orange-500" />
              <span className="text-sm font-medium text-muted-foreground">Total de Vendas</span>
            </div>
            <p className="text-xl font-bold text-foreground text-center">{resumo.totalVendas}</p>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">Bingos Participados</span>
            </div>
            <p className="text-xl font-bold text-foreground text-center">{resumo.bingosParticipados}</p>
          </Card>
        </div>

        {/* Histórico de Vendas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Histórico de Vendas</h3>
          {vendas.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma venda realizada ainda</p>
          ) : (
            <div className="space-y-4">
              {vendas.map((venda) => (
                <Card key={venda.pedidoId} className="p-4 bg-muted/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-foreground">{venda.bingo.nome}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>
                            {format(new Date(venda.dataVenda), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {venda.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success">R$ {venda.valorVenda}</p>
                      <p className="text-sm text-muted-foreground">{venda.quantidadeVendida} cartelas</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Valor por cartela: </span>
                      <span className="font-medium">R$ {venda.bingo.valorCartela}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data do bingo: </span>
                      <span className="font-medium">
                        {format(new Date(venda.bingo.dataBingo), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">Cartelas vendidas: </span>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {venda.cartelasVendidas.join(', ')}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}