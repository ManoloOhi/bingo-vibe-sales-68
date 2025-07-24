import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, DollarSign, Target, Users, Calendar, User, Phone, Mail } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVendasBingo } from '@/hooks/useQueryData';
import { useBingo } from '@/hooks/useQueryData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BingoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: bingo, isLoading: bingoLoading } = useBingo(id!);
  const { data: vendasData, isLoading: vendasLoading } = useVendasBingo(id!);

  const isLoading = bingoLoading || vendasLoading;

  if (isLoading) {
    return (
      <PageLayout title="Detalhes do Bingo" subtitle="Carregando informações...">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!bingo || !vendasData) {
    return (
      <PageLayout title="Detalhes do Bingo" subtitle="Bingo não encontrado">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Bingo não encontrado</p>
          <Button onClick={() => navigate('/bingos')} className="mt-4">
            <ArrowLeft size={16} className="mr-2" />
            Voltar para Bingos
          </Button>
        </Card>
      </PageLayout>
    );
  }

  const percentualVendido = parseFloat(vendasData.resumo.percentualVendido);

  return (
    <PageLayout title="Detalhes do Bingo" subtitle="">
      <div className="space-y-6">
        {/* Header consolidado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/bingos')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{bingo.nome}</h1>
              <p className="text-sm text-muted-foreground">
                Cartelas: {String(bingo.rangeInicio).padStart(3, '0')}-{String(bingo.rangeFim).padStart(3, '0')} • {format(new Date(bingo.dataBingo), "dd/MM/yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={bingo.ativo ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
              {bingo.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        </div>

        {/* Resumo do Bingo */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">Resumo de Vendas</h3>
                <p className="text-sm text-muted-foreground">
                  <Calendar size={14} className="inline mr-1" />
                  {format(new Date(bingo.dataBingo), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">R$ {bingo.valorCartela}</p>
                <p className="text-sm text-muted-foreground">por cartela</p>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso de vendas</span>
                <span>{percentualVendido.toFixed(1)}%</span>
              </div>
              <Progress value={percentualVendido} className="h-2" />
            </div>
          </div>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <Target size={20} className="text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Total Cartelas</p>
            <p className="text-xl font-bold">{bingo.quantidadeCartelas}</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Users size={20} className="text-success mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Vendidas</p>
            <p className="text-xl font-bold">{vendasData.resumo.totalCartelasVendidas}</p>
          </Card>
          
          <Card className="p-4 text-center">
            <DollarSign size={20} className="text-warning mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Arrecadado</p>
            <p className="text-xl font-bold">R$ {vendasData.resumo.valorTotalVendas}</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Calendar size={20} className="text-accent mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Vendas</p>
            <p className="text-xl font-bold">{vendasData.resumo.totalVendas}</p>
          </Card>
        </div>

        {/* Lista de Vendas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Histórico de Vendas</h3>
          
          {vendasData.vendas.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhuma venda registrada</p>
          ) : (
            <div className="space-y-4">
              {vendasData.vendas.map((venda, index) => (
                <div key={venda.pedidoId}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-primary" />
                        <span className="font-medium">{venda.vendedor.nome}</span>
                        <Badge variant="outline">{venda.status}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          {venda.vendedor.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          {venda.vendedor.whatsapp}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(venda.dataVenda), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-lg">R$ {venda.valorVenda}</p>
                      <p className="text-sm text-muted-foreground">
                        {venda.quantidadeVendida} cartelas
                      </p>
                    </div>
                  </div>
                  
                  {/* Cartelas vendidas */}
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Cartelas vendidas:</p>
                    <div className="flex flex-wrap gap-1">
                      {venda.cartelasVendidas.map((cartela) => (
                        <Badge key={cartela} variant="secondary" className="text-xs">
                          {String(cartela).padStart(3, '0')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {index < vendasData.vendas.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}