import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, Package, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { VendedorService } from '@/services/mockVendedorService';
import { PedidoService } from '@/services/mockPedidoService';
import type { Vendedor } from '@/services/mockVendedorService';

export default function Vendedores() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidosAtivos, setPedidosAtivos] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadVendedores = async () => {
      try {
        const vendedoresData = await VendedorService.list();
        setVendedores(vendedoresData);

        // Carregar pedidos ativos por vendedor
        const pedidosPorVendedor: Record<string, number> = {};
        for (const vendedor of vendedoresData) {
          const pedidos = await PedidoService.findByVendedor(vendedor.id);
          const pedidosAbertos = pedidos.filter(p => p.status === 'aberto').length;
          pedidosPorVendedor[vendedor.id] = pedidosAbertos;
        }
        setPedidosAtivos(pedidosPorVendedor);
      } catch (error) {
        console.error('Erro ao carregar vendedores:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVendedores();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Vendedores" subtitle="Gerencie sua equipe">
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
    <PageLayout title="Vendedores" subtitle="Gerencie sua equipe">
      <div className="space-y-4">
        <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
          <Plus size={18} />
          Adicionar Vendedor
        </Button>
        
        <div className="space-y-3">
          {vendedores.length === 0 ? (
            <Card className="p-6 text-center shadow-[var(--shadow-card)]">
              <p className="text-muted-foreground">Nenhum vendedor encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">Adicione vendedores para começar a vender cartelas</p>
            </Card>
          ) : (
            vendedores.map((vendedor) => {
              const pedidos = pedidosAtivos[vendedor.id] || 0;
              
              return (
                <Card key={vendedor.id} className="p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{vendedor.nome}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{vendedor.whatsapp}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Mail size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{vendedor.email}</span>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={pedidos > 0 ? "bg-success text-success-foreground" : vendedor.ativo ? "" : "bg-muted text-muted-foreground"}
                    >
                      {!vendedor.ativo ? 'Inativo' : pedidos > 0 ? 'Ativo' : 'Livre'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-primary" />
                      <span className="text-sm font-medium">{pedidos} pedidos ativos</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
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