import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Minus } from 'lucide-react';
import { PedidoService } from '@/services/realPedidoService';
import { useToast } from '@/hooks/use-toast';
import { useVenderCartelas, useBingoEstoque } from '@/hooks/useQueryData';
import type { Pedido } from '@/services/realPedidoService';

interface VenderCartelasFormProps {
  pedido: Pedido;
  onCartelasUpdated?: () => void;
}

export function VenderCartelasForm({ pedido, onCartelasUpdated }: VenderCartelasFormProps) {
  const [open, setOpen] = useState(false);
  const [cartelasSelecionadas, setCartelasSelecionadas] = useState<number[]>([]);
  const [ultimaCartelaSelecionada, setUltimaCartelaSelecionada] = useState<number | null>(null);
  const { toast } = useToast();
  const venderCartelas = useVenderCartelas();
  const { data: estoque } = useBingoEstoque(pedido.bingoId);

  // Cartelas disponíveis para venda (pendentes)
  const cartelasDisponiveis = pedido.cartelasPendentes;

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
        description: "Selecione pelo menos uma cartela para vender",
        variant: "destructive"
      });
      return;
    }

    try {
      await venderCartelas.mutateAsync({ 
        pedidoId: pedido.id, 
        cartelas: cartelasSelecionadas 
      });

      toast({
        title: "Sucesso!",
        description: `${cartelasSelecionadas.length} cartela(s) vendida(s) com sucesso`
      });

      setCartelasSelecionadas([]);
      setOpen(false);
      onCartelasUpdated?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao vender cartelas",
        variant: "destructive"
      });
    }
  };

  if (cartelasDisponiveis.length === 0) {
    return (
      <Button variant="outline" size="sm" disabled>
        <ShoppingCart size={16} />
        Sem Cartelas
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ShoppingCart size={16} />
          Vender Cartelas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl w-[90vw] max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vender Cartelas</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status do Estoque */}
          <div className="bg-muted/50 border p-4 rounded-lg">
            <div className="text-sm font-medium mb-2">Status do Estoque</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Disponível: </span>
                <span className="font-medium">{estoque?.estoque || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pendente: </span>
                <span className="font-medium">{estoque?.pendente || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Vendido: </span>
                <span className="font-medium">{estoque?.vendido || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p><strong>Cartelas pendentes neste pedido:</strong> {cartelasDisponiveis.length}</p>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">
              Cartelas Pendentes 
              <span className="text-xs text-muted-foreground ml-2">(Ctrl+click para seleção em range)</span>
            </div>
            <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto border rounded p-3">
              {cartelasDisponiveis.map(cartela => (
                <Badge
                  key={cartela}
                  variant={cartelasSelecionadas.includes(cartela) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={(event) => toggleCartela(cartela, event)}
                >
                  {cartela}
                </Badge>
              ))}
            </div>
          </div>

          {cartelasSelecionadas.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Selecionadas para Venda ({cartelasSelecionadas.length})</div>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto border rounded p-2 bg-muted/50">
                {cartelasSelecionadas.map(cartela => (
                  <Badge
                    key={cartela}
                    variant="default"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(event) => toggleCartela(cartela, event)}
                  >
                    {cartela} <Minus size={12} className="ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
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
              disabled={venderCartelas.isPending || cartelasSelecionadas.length === 0}
              className="flex-1"
            >
              {venderCartelas.isPending ? "Vendendo..." : `Vender ${cartelasSelecionadas.length} Cartela(s)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}