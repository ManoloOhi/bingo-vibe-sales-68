import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreatePedidoForm } from '@/components/forms/CreatePedidoForm';
import { EditPedidoForm } from '@/components/forms/EditPedidoForm';
import { RetirarCartelasForm } from '@/components/forms/RetirarCartelasForm';
import { VenderCartelasForm } from '@/components/forms/VenderCartelasForm';
import { DevolverCartelasForm } from '@/components/forms/DevolverCartelasForm';
import { PageLayout } from '@/components/Layout/PageLayout';
import { PedidoService } from '@/services/realPedidoService';
import { VendedorService } from '@/services/realVendedorService';
import { BingoService } from '@/services/realBingoService';
import { useAuth } from '@/contexts/AuthContext';
import type { Pedido } from '@/services/realPedidoService';
import type { Vendedor } from '@/services/realVendedorService';
import type { Bingo } from '@/services/realBingoService';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [vendedores, setVendedores] = useState<{ [key: string]: Vendedor }>({});
  const [bingos, setBingos] = useState<{ [key: string]: Bingo }>({});
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  const loadPedidos = async () => {
    try {
      setLoading(true);
      const [pedidosData, vendedoresData, bingosData] = await Promise.all([
        PedidoService.list(),
        VendedorService.list(),
        BingoService.list()
      ]);
      
      setPedidos(pedidosData);
      
      // Criar mapas para lookup rápido
      const vendedoresMap = vendedoresData.reduce((acc, v) => ({ ...acc, [v.id]: v }), {});
      const bingosMap = bingosData.reduce((acc, b) => ({ ...acc, [b.id]: b }), {});
      
      setVendedores(vendedoresMap);
      setBingos(bingosMap);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePedidoCreated = () => {
    loadPedidos();
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Pedidos" subtitle="Controle de cartelas">
        <div className="space-y-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  const pageTitle = isAdmin ? "Pedidos" : "Meus Pedidos";
  const pageSubtitle = isAdmin ? "Controle de cartelas" : "Controle das minhas cartelas";

  return (
    <PageLayout title={pageTitle} subtitle={pageSubtitle}>
      <div className="space-y-4">
        <CreatePedidoForm onPedidoCreated={handlePedidoCreated} />
        
        <div className="space-y-3">
          {pedidos.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">
                {isAdmin ? "Nenhum pedido encontrado" : "Você ainda não tem pedidos"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isAdmin ? "Crie o primeiro pedido para começar" : "Crie seu primeiro pedido para começar"}
              </p>
            </Card>
          ) : (
            pedidos.map((pedido) => {
              const vendedor = vendedores[pedido.vendedorId];
              const bingo = bingos[pedido.bingoId];
              // Debug log
              console.log('Pedido data:', {
                id: pedido.id,
                retiradas: pedido.cartelasRetiradas,
                pendentes: pedido.cartelasPendentes,
                vendidas: pedido.cartelasVendidas,
                devolvidas: pedido.cartelasDevolvidas
              });

              return (
                <Card key={pedido.id} className="border border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {vendedor?.nome || 'Vendedor não encontrado'}
                      </CardTitle>
                      <Badge variant={pedido.status === 'aberto' ? 'default' : 'secondary'}>
                        {pedido.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {bingo?.nome || 'Bingo não encontrado'}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Pendentes:</span>
                        <Badge variant="secondary" className="ml-2">
                          {pedido.cartelasPendentes.length}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Vendidas:</span>
                        <Badge variant="default" className="ml-2">
                          {pedido.cartelasVendidas.length}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Devolvidas:</span>
                        <Badge variant="destructive" className="ml-2">
                          {pedido.cartelasDevolvidas.length}
                        </Badge>
                      </div>
                    </div>

                    {pedido.cartelasRetiradas.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Cartelas Retiradas:</p>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                          {pedido.cartelasRetiradas.map(cartela => (
                            <Badge
                              key={cartela}
                              variant={
                                pedido.cartelasVendidas.includes(cartela) 
                                  ? "default" 
                                  : pedido.cartelasDevolvidas.includes(cartela)
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {cartela}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <EditPedidoForm pedido={pedido} onPedidoUpdated={loadPedidos} />
                      <RetirarCartelasForm pedido={pedido} onCartelasUpdated={loadPedidos} />
                      <VenderCartelasForm pedido={pedido} onCartelasUpdated={loadPedidos} />
                      <DevolverCartelasForm pedido={pedido} onCartelasUpdated={loadPedidos} />
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </PageLayout>
  );
}