import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, Package } from 'lucide-react';

export default function Vendedores() {
  return (
    <PageLayout title="Vendedores" subtitle="Gerencie sua equipe">
      <div className="space-y-4">
        <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
          <Plus size={18} />
          Adicionar Vendedor
        </Button>
        
        <div className="space-y-3">
          {[
            { nome: 'João Silva', telefone: '(11) 99999-9999', email: 'joao@email.com', pedidos: 3 },
            { nome: 'Maria Santos', telefone: '(11) 88888-8888', email: 'maria@email.com', pedidos: 1 },
            { nome: 'Pedro Costa', telefone: '(11) 77777-7777', email: 'pedro@email.com', pedidos: 0 },
          ].map((vendedor, i) => (
            <Card key={i} className="p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{vendedor.nome}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Phone size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{vendedor.telefone}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Mail size={12} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{vendedor.email}</span>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={vendedor.pedidos > 0 ? "bg-success text-success-foreground" : ""}
                >
                  {vendedor.pedidos > 0 ? 'Ativo' : 'Livre'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-primary" />
                  <span className="text-sm font-medium">{vendedor.pedidos} pedidos ativos</span>
                </div>
                <Button variant="outline" size="sm">
                  Ver Detalhes
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}