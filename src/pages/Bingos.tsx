import { PageLayout } from '@/components/Layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Users, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BingoService } from '@/services/bingoService';
import { PedidoService } from '@/services/pedidoService';
import { CreateBingoForm } from '@/components/forms/CreateBingoForm';
import { EditBingoForm } from '@/components/forms/EditBingoForm';
import type { Bingo } from '@/db/schema';

export default function Bingos() {
  const [bingos, setBingos] = useState<Bingo[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState<Record<string, number>>({});

  const loadBingos = async () => {
    try {
      const bingosData = await BingoService.list();
      setBingos(bingosData);

      // Carregar vendas por bingo
      const vendasPorBingo: Record<string, number> = {};
      for (const bingo of bingosData) {
        const pedidos = await PedidoService.findByBingo(bingo.id);
        const totalVendidas = pedidos.reduce((total, p) => total + p.cartelasVendidas.length, 0);
        vendasPorBingo[bingo.id] = totalVendidas;
      }
      setVendas(vendasPorBingo);
    } catch (error) {
      console.error('Erro ao carregar bingos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBingoCreated = () => {
    loadBingos();
  };

  const handleBingoUpdated = () => {
    loadBingos();
  };

  useEffect(() => {
    loadBingos();
  }, []);

  if (loading) {
    return (
      <PageLayout title="Bingos" subtitle="Gerencie seus eventos">
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
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-12 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                    <div className="h-12 bg-muted rounded"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Bingos" subtitle="Gerencie seus eventos">
      <div className="space-y-4">
        <CreateBingoForm onBingoCreated={handleBingoCreated} />
        
        <div className="space-y-3">
          {bingos.length === 0 ? (
            <Card className="p-6 text-center shadow-[var(--shadow-card)]">
              <p className="text-muted-foreground">Nenhum bingo encontrado</p>
              <p className="text-sm text-muted-foreground mt-1">Crie seu primeiro bingo para começar</p>
            </Card>
          ) : (
            bingos.map((bingo) => {
              const totalVendidas = vendas[bingo.id] || 0;
              const restantes = bingo.quantidadeCartelas - totalVendidas;
              
              return (
                <Card key={bingo.id} className="p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{bingo.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        Cartelas: {String(bingo.rangeInicio).padStart(3, '0')}-{String(bingo.rangeFim).padStart(3, '0')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bingo.dataBingo).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="secondary" className={bingo.ativo ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                      {bingo.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Target size={16} className="text-primary" />
                      <span className="text-xs text-muted-foreground">Total</span>
                      <span className="font-semibold">{bingo.quantidadeCartelas}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Users size={16} className="text-warning" />
                      <span className="text-xs text-muted-foreground">Vendidas</span>
                      <span className="font-semibold">{totalVendidas}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Calendar size={16} className="text-success" />
                      <span className="text-xs text-muted-foreground">Restam</span>
                      <span className="font-semibold">{restantes}</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-border mt-3">
                    <EditBingoForm bingo={bingo} onBingoUpdated={handleBingoUpdated} />
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