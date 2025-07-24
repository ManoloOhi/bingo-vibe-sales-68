import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Package, Loader2, TrendingUp, DollarSign, Eye } from 'lucide-react';
import { CreateVendedorForm } from '@/components/forms/CreateVendedorForm';
import { EditVendedorForm } from '@/components/forms/EditVendedorForm';
import { DeleteVendedorForm } from '@/components/forms/DeleteVendedorForm';
import { CacheDebug } from '@/components/ui/cache-debug';
import type { Vendedor } from '@/services/realVendedorService';
import { useVendedores, usePedidosByVendedor, useVendasVendedor } from '@/hooks/useQueryData';
import { useQueryPersister } from '@/hooks/useQueryPersister';
import { useNavigate } from 'react-router-dom';

// Hook para contar pedidos ativos de um vendedor
const VendedorPedidos = ({ vendedorId }: { vendedorId: string }) => {
  const { data: pedidos = [] } = usePedidosByVendedor(vendedorId);
  const pedidosAbertos = pedidos.filter(p => p.status === 'aberto').length;
  
  return (
    <div className="flex items-center gap-2">
      <Package size={16} className="text-primary" />
      <span className="text-sm font-medium">{pedidosAbertos} pedidos ativos</span>
    </div>
  );
};

export default function Vendedores() {
  const { data: vendedores = [], isLoading: loading } = useVendedores();
  
  // Ativar persistência automática
  useQueryPersister();

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
        <CreateVendedorForm />
        
        <div className="space-y-3">
          {vendedores.length === 0 ? (
            <Card className="p-6 text-center shadow-[var(--shadow-card)]">
              <p className="text-muted-foreground">Nenhum vendedor encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">Adicione vendedores para começar a vender cartelas</p>
            </Card>
          ) : (
            vendedores.map((vendedor) => (
              <VendedorCard key={vendedor.id} vendedor={vendedor} />
            ))
          )}
        </div>
      </div>
      <CacheDebug />
    </PageLayout>
  );
}

// Componente separado para cada vendedor
const VendedorCard = ({ vendedor }: { vendedor: Vendedor }) => {
  const navigate = useNavigate();
  const { data: pedidos = [] } = usePedidosByVendedor(vendedor.id);
  const { data: vendasData } = useVendasVendedor(vendedor.id);
  const pedidosAbertos = pedidos.filter(p => p.status === 'aberto').length;
  
  const totalVendido = vendasData?.resumo?.valorTotalVendas || "0.00";
  const cartelasVendidas = vendasData?.resumo?.totalCartelasVendidas || 0;
  const totalVendas = vendasData?.resumo?.totalVendas || 0;
  
  const getPerformanceBadge = () => {
    const valor = parseFloat(totalVendido);
    if (valor >= 500) return { text: "Top Seller", color: "bg-success text-success-foreground" };
    if (valor >= 200) return { text: "Vendedor", color: "bg-primary text-primary-foreground" };
    if (valor > 0) return { text: "Iniciante", color: "bg-secondary text-secondary-foreground" };
    return { text: vendedor.ativo ? "Livre" : "Inativo", color: "bg-muted text-muted-foreground" };
  };
  
  const performanceBadge = getPerformanceBadge();
  
  return (
    <Card className="p-4 shadow-[var(--shadow-card)] hover:shadow-lg transition-shadow">
      <div className="space-y-3">
        {/* Header do vendedor */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">{vendedor.nome}</h3>
              <Badge className={performanceBadge.color}>
                {performanceBadge.text}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Phone size={12} className="text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{vendedor.whatsapp}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail size={12} className="text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{vendedor.email}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Métricas de Performance */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-border">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign size={12} className="text-success" />
              <span className="text-xs font-medium text-muted-foreground">Total</span>
            </div>
            <p className="text-sm font-semibold text-success">R$ {totalVendido}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={12} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Cartelas</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{cartelasVendidas}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Package size={12} className="text-orange-500" />
              <span className="text-xs font-medium text-muted-foreground">Vendas</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{totalVendas}</p>
          </div>
        </div>
        
        {/* Footer com pedidos e ações */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex items-center gap-1 text-primary">
              <Package size={14} className="flex-shrink-0" />
              <span className="text-sm font-medium">{pedidosAbertos}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {vendedor.ativo ? 'aberto' : 'inativo'}
            </Badge>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/vendedores/${vendedor.id}/detalhes`)}
              className="h-8 w-8 p-0"
            >
              <Eye size={14} />
            </Button>
            <EditVendedorForm vendedor={vendedor} />
            <DeleteVendedorForm vendedor={vendedor} pedidosAtivos={pedidosAbertos} />
          </div>
        </div>
      </div>
    </Card>
  );
};