import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Target, Users } from 'lucide-react';

export default function Bingos() {
  return (
    <PageLayout title="Bingos" subtitle="Gerencie seus eventos">
      <div className="space-y-4">
        <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
          <Plus size={18} />
          Criar Novo Bingo
        </Button>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 shadow-[var(--shadow-card)]">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">Bingo da Festa Junina</h3>
                  <p className="text-sm text-muted-foreground">Cartelas: 001-500</p>
                </div>
                <Badge variant="secondary" className="bg-success text-success-foreground">
                  Ativo
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Target size={16} className="text-primary" />
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="font-semibold">500</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Users size={16} className="text-warning" />
                  <span className="text-xs text-muted-foreground">Vendidas</span>
                  <span className="font-semibold">127</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Calendar size={16} className="text-success" />
                  <span className="text-xs text-muted-foreground">Restam</span>
                  <span className="font-semibold">373</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}