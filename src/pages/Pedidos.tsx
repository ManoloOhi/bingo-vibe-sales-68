import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, CheckCircle, XCircle, Package } from 'lucide-react';

export default function Pedidos() {
  return (
    <PageLayout title="Pedidos" subtitle="Controle de cartelas">
      <div className="space-y-4">
        <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
          <Plus size={18} />
          Novo Pedido
        </Button>
        
        <div className="space-y-3">
          {[
            { id: '#001', vendedor: 'João Silva', cartelas: '001-050', status: 'Retirado', total: 50 },
            { id: '#002', vendedor: 'Maria Santos', cartelas: '051-100', status: 'Vendido', total: 50 },
            { id: '#003', vendedor: 'Pedro Costa', cartelas: '101-125', status: 'Pendente', total: 25 },
          ].map((pedido, i) => (
            <Card key={i} className="p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{pedido.id}</h3>
                    <Badge 
                      variant="secondary" 
                      className={
                        pedido.status === 'Vendido' 
                          ? "bg-success text-success-foreground"
                          : pedido.status === 'Retirado'
                          ? "bg-warning text-warning-foreground" 
                          : ""
                      }
                    >
                      {pedido.status === 'Vendido' && <CheckCircle size={12} />}
                      {pedido.status === 'Retirado' && <Clock size={12} />}
                      {pedido.status === 'Pendente' && <XCircle size={12} />}
                      {pedido.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pedido.vendedor}</p>
                  <p className="text-sm text-foreground">Cartelas: {pedido.cartelas}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-primary" />
                  <span className="text-sm font-medium">{pedido.total} cartelas</span>
                </div>
                <div className="flex gap-2">
                  {pedido.status === 'Retirado' && (
                    <Button size="sm" variant="outline">
                      Finalizar
                    </Button>
                  )}
                  {pedido.status === 'Pendente' && (
                    <Button size="sm">
                      Entregar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}