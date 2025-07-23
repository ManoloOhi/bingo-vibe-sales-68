import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, Minus } from 'lucide-react';
import { PedidoService } from '@/services/pedidoService';
import { BingoService } from '@/services/bingoService';
import { useToast } from '@/hooks/use-toast';
import type { Pedido } from '@/db/schema';

interface RetirarCartelasFormProps {
  pedido: Pedido;
  onCartelasUpdated?: () => void;
}

export function RetirarCartelasForm({ pedido, onCartelasUpdated }: RetirarCartelasFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartelasDisponiveis, setCartelasDisponiveis] = useState<number[]>([]);
  const [cartelasSelecionadas, setCartelasSelecionadas] = useState<number[]>([]);
  const [rangeInicio, setRangeInicio] = useState('');
  const [rangeFim, setRangeFim] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadCartelasDisponiveis = async () => {
      if (open) {
        try {
          const cartelas = await BingoService.getCartelasDisponiveis(pedido.bingoId);
          setCartelasDisponiveis(cartelas);
        } catch (error) {
          console.error('Erro ao carregar cartelas:', error);
        }
      }
    };

    loadCartelasDisponiveis();
  }, [open, pedido.bingoId]);

  const adicionarRange = () => {
    if (!rangeInicio || !rangeFim) return;
    
    const inicio = parseInt(rangeInicio);
    const fim = parseInt(rangeFim);
    
    if (inicio > fim) {
      toast({
        title: "Erro",
        description: "O início do range deve ser menor que o fim",
        variant: "destructive"
      });
      return;
    }

    const novasCartelas = [];
    for (let i = inicio; i <= fim; i++) {
      if (cartelasDisponiveis.includes(i) && !cartelasSelecionadas.includes(i)) {
        novasCartelas.push(i);
      }
    }

    setCartelasSelecionadas(prev => [...prev, ...novasCartelas].sort((a, b) => a - b));
    setRangeInicio('');
    setRangeFim('');
  };

  const removerCartela = (cartela: number) => {
    setCartelasSelecionadas(prev => prev.filter(c => c !== cartela));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartelasSelecionadas.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma cartela",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await PedidoService.retirarCartelas(pedido.id, cartelasSelecionadas);

      toast({
        title: "Sucesso!",
        description: `${cartelasSelecionadas.length} cartela(s) retirada(s) com sucesso`
      });

      setCartelasSelecionadas([]);
      setOpen(false);
      onCartelasUpdated?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao retirar cartelas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Package size={16} />
          Retirar Cartelas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Retirar Cartelas</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {cartelasDisponiveis.length} cartela(s) disponível(is)
          </div>

          <div className="space-y-3">
            <Label>Selecionar Range</Label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Início"
                  value={rangeInicio}
                  onChange={(e) => setRangeInicio(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Fim"
                  value={rangeFim}
                  onChange={(e) => setRangeFim(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={adicionarRange}
                disabled={!rangeInicio || !rangeFim}
              >
                Adicionar
              </Button>
            </div>
          </div>

          {cartelasSelecionadas.length > 0 && (
            <div className="space-y-2">
              <Label>Cartelas Selecionadas ({cartelasSelecionadas.length})</Label>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto border rounded p-2">
                {cartelasSelecionadas.map(cartela => (
                  <Badge
                    key={cartela}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removerCartela(cartela)}
                  >
                    {cartela} <Minus size={12} className="ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || cartelasSelecionadas.length === 0}
              className="flex-1"
            >
              {loading ? "Retirando..." : `Retirar ${cartelasSelecionadas.length} Cartela(s)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}