import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Minus } from 'lucide-react';
import { PedidoService } from '@/services/realPedidoService';
import { useToast } from '@/hooks/use-toast';
import type { Pedido } from '@/services/realPedidoService';

interface DevolverCartelasFormProps {
  pedido: Pedido;
  onCartelasUpdated?: () => void;
}

export function DevolverCartelasForm({ pedido, onCartelasUpdated }: DevolverCartelasFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartelasSelecionadas, setCartelasSelecionadas] = useState<number[]>([]);
  const [ultimaCartelaSelecionada, setUltimaCartelaSelecionada] = useState<number | null>(null);
  const { toast } = useToast();

  // Cartelas disponíveis para devolução = vendidas - já devolvidas
  const cartelasDisponiveis = pedido.cartelasVendidas.filter(c => 
    !pedido.cartelasDevolvidas.includes(c)
  );

  const getCartelasNoRange = (inicio: number, fim: number): number[] => {
    const min = Math.min(inicio, fim);
    const max = Math.max(inicio, fim);
    return cartelasDisponiveis.filter(cartela => cartela >= min && cartela <= max);
  };

  const toggleCartela = (cartela: number, event?: React.MouseEvent) => {
    const isCtrlPressed = event?.ctrlKey || event?.metaKey;
    
    if (isCtrlPressed && ultimaCartelaSelecionada !== null) {
      // Seleção em range
      const cartelasNoRange = getCartelasNoRange(ultimaCartelaSelecionada, cartela);
      const cartelasSelecionadasNoRange = cartelasNoRange.filter(c => cartelasSelecionadas.includes(c));
      const maioriaSelecionada = cartelasSelecionadasNoRange.length > cartelasNoRange.length / 2;
      
      setCartelasSelecionadas(prev => {
        if (maioriaSelecionada) {
          // Desselecierar todas no range
          return prev.filter(c => !cartelasNoRange.includes(c));
        } else {
          // Selecionar todas no range
          const novasSelecoes = cartelasNoRange.filter(c => !prev.includes(c));
          return [...prev, ...novasSelecoes].sort((a, b) => a - b);
        }
      });
    } else {
      // Seleção individual
      setCartelasSelecionadas(prev => 
        prev.includes(cartela) 
          ? prev.filter(c => c !== cartela)
          : [...prev, cartela].sort((a, b) => a - b)
      );
    }
    
    setUltimaCartelaSelecionada(cartela);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartelasSelecionadas.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma cartela para devolver",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      await PedidoService.devolverCartelas(pedido.id, cartelasSelecionadas);

      toast({
        title: "Sucesso!",
        description: `${cartelasSelecionadas.length} cartela(s) devolvida(s) com sucesso`
      });

      setCartelasSelecionadas([]);
      setOpen(false);
      onCartelasUpdated?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao devolver cartelas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartelasDisponiveis.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <RotateCcw size={16} />
        Sem Cartelas
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RotateCcw size={16} />
          Devolver Cartelas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Devolver Cartelas</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {cartelasDisponiveis.length} cartela(s) disponível(is) para devolução
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">
              Cartelas Vendidas 
              <span className="text-xs text-muted-foreground ml-2">(Ctrl+click para seleção em range)</span>
            </div>
            <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto border rounded p-3">
              {cartelasDisponiveis.map(cartela => (
                <Badge
                  key={cartela}
                  variant={cartelasSelecionadas.includes(cartela) ? "destructive" : "outline"}
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(event) => toggleCartela(cartela, event)}
                >
                  {cartela}
                </Badge>
              ))}
            </div>
          </div>

          {cartelasSelecionadas.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Selecionadas para Devolução ({cartelasSelecionadas.length})</div>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto border rounded p-2 bg-destructive/10">
                {cartelasSelecionadas.map(cartela => (
                  <Badge
                    key={cartela}
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={(event) => toggleCartela(cartela, event)}
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
              variant="destructive"
            >
              {loading ? "Devolvendo..." : `Devolver ${cartelasSelecionadas.length} Cartela(s)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}