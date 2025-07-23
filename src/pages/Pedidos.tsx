import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle, Package, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PedidoService } from '@/services/mockPedidoService';
import { VendedorService } from '@/services/mockVendedorService';
import type { Pedido } from '@/services/mockPedidoService';
import type { Vendedor } from '@/services/mockVendedorService';

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [vendedores, setVendedores] = useState<Record<string, Vendedor>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPedidos = async () => {
      try {
        const [pedidosData, vendedoresData] = await Promise.all([
          PedidoService.list(),
          VendedorService.list()
        ]);

        setPedidos(pedidosData);

        // Criar mapa de vendedores por ID
        const vendedoresMap = vendedoresData.reduce((acc, v) => {
          acc[v.id] = v;
          return acc;
        }, {} as Record<string, Vendedor>);
        setVendedores(vendedoresMap);
      } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPedidos();
  }, []);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'aberto':
        return { label: 'Aberto', icon: Clock, className: "bg-warning text-warning-foreground" };
      case 'fechado':
        return { label: 'Fechado', icon: CheckCircle, className: "bg-success text-success-foreground" };
      case 'cancelado':
        return { label: 'Cancelado', icon: XCircle, className: "bg-destructive text-destructive-foreground" };
      default:
        return { label: status, icon: XCircle, className: "" };
    }
  };

  const formatCartelasRange = (cartelas: number[]) => {
    if (cartelas.length === 0) return 'Nenhuma';
    if (cartelas.length === 1) return String(cartelas[0]).padStart(3, '0');
    
    const sorted = [...cartelas].sort((a, b) => a - b);
    const first = String(sorted[0]).padStart(3, '0');
    const last = String(sorted[sorted.length - 1]).padStart(3, '0');
    return `${first}-${last}`;
  };

  if (loading) {
    return (
      <PageLayout title="Pedidos" subtitle="Controle de cartelas">
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

  return (
    <PageLayout title="Pedidos" subtitle="Controle de cartelas">
      <div className="space-y-4">
        <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
          <Plus size={18} />
          Novo Pedido
        </Button>
        
        <div className="space-y-3">
          {pedidos.length === 0 ? (
            <Card className="p-6 text-center shadow-[var(--shadow-card)]">
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro pedido para começar</p>
            </Card>
          ) : (
            pedidos.map((pedido) => {
              const vendedor = vendedores[pedido.vendedorId];
              const statusInfo = getStatusDisplay(pedido.status);
              const StatusIcon = statusInfo.icon;
              const totalCartelas = pedido.cartelasRetiradas.length;
              const cartelasRange = formatCartelasRange(pedido.cartelasRetiradas);
              
              return (
                <Card key={pedido.id} className="p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">#{pedido.id.slice(-8)}</h3>
                        <Badge variant="secondary" className={statusInfo.className}>
                          <StatusIcon size={12} />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{vendedor?.nome || 'Vendedor não encontrado'}</p>
                      <p className="text-sm text-foreground">Cartelas: {cartelasRange}</p>
                      <p className="text-xs text-muted-foreground">
                        Criado: {new Date(pedido.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-primary" />
                      <span className="text-sm font-medium">
                        {totalCartelas} cartelas | 
                        {pedido.cartelasVendidas.length} vendidas | 
                        {pedido.cartelasPendentes.length} pendentes
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {pedido.status === 'aberto' && (
                        <Button size="sm" variant="outline">
                          Gerenciar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </PageLayout>
  );
}