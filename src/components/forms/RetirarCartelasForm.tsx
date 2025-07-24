import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Minus, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRetirarCartelas, useCartelasDisponiveis } from '@/hooks/useQueryData';
import type { Pedido } from '@/services/realPedidoService';

interface RetirarCartelasFormProps {
  pedido: Pedido;
  onCartelasUpdated?: () => void;
}

export function RetirarCartelasForm({ pedido, onCartelasUpdated }: RetirarCartelasFormProps) {
  const [open, setOpen] = useState(false);
  const [cartelasSelecionadas, setCartelasSelecionadas] = useState<number[]>([]);
  const [rangeInicio, setRangeInicio] = useState('');
  const [rangeFim, setRangeFim] = useState('');
  const { toast } = useToast();
  const retirarCartelas = useRetirarCartelas();
  
  // Usar o novo hook para cartelas disponíveis
  const { cartelasDisponiveis, estatisticas, validarRange } = useCartelasDisponiveis(pedido.bingoId);

  // Validação em tempo real do range
  const rangeValidation = (() => {
    if (!rangeInicio || !rangeFim) return null;
    
    const inicio = parseInt(rangeInicio);
    const fim = parseInt(rangeFim);
    
    if (isNaN(inicio) || isNaN(fim)) return null;
    if (inicio > fim) return { valido: false, erro: 'Início deve ser menor que fim' };
    
    return validarRange(inicio, fim);
  })();

  const adicionarRange = () => {
    if (!rangeValidation || !rangeValidation.valido) {
      if (rangeValidation && 'erro' in rangeValidation) {
        toast({
          title: "Erro no range",
          description: rangeValidation.erro,
          variant: "destructive"
        });
      }
      return;
    }
    
    // Type guard para verificar se a validação tem as propriedades necessárias
    if (!('cartelas' in rangeValidation)) return;
    
    const novasCartelas = rangeValidation.cartelas.filter(
      cartela => !cartelasSelecionadas.includes(cartela)
    );

    if (novasCartelas.length === 0) {
      toast({
        title: "Aviso",
        description: "Todas as cartelas deste range já estão selecionadas",
        variant: "default"
      });
      return;
    }

    setCartelasSelecionadas(prev => [...prev, ...novasCartelas].sort((a, b) => a - b));
    setRangeInicio('');
    setRangeFim('');
    
    // Verificar se há conflitos e mostrar feedback
    if ('conflitos' in rangeValidation && rangeValidation.conflitos.length > 0) {
      toast({
        title: "Range filtrado",
        description: `${rangeValidation.conflitos.length} cartela(s) ocupada(s) foi(ram) ignorada(s): ${rangeValidation.conflitos.join(', ')}`,
        variant: "default"
      });
    }
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

    try {
      await retirarCartelas.mutateAsync({ 
        pedidoId: pedido.id, 
        cartelas: cartelasSelecionadas 
      });

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
          {/* Estatísticas do Bingo */}
          {estatisticas && (
            <div className="bg-muted/50 p-3 rounded space-y-2">
              <div className="text-sm font-medium">Estatísticas do Bingo</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{estatisticas.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Disponíveis:</span>
                  <span className="font-medium text-green-600">{estatisticas.disponiveis}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Ocupadas:</span>
                  <span className="font-medium text-red-600">{estatisticas.ocupadas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">Devolvidas:</span>
                  <span className="font-medium text-blue-600">{estatisticas.devolvidas}</span>
                </div>
              </div>
            </div>
          )}

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
                disabled={!rangeInicio || !rangeFim || (rangeValidation && !rangeValidation.valido)}
              >
                Adicionar
              </Button>
            </div>
            
            {/* Feedback visual do range */}
            {rangeValidation && (
              <div className="space-y-2">
                {rangeValidation.valido ? (
                  'cartelas' in rangeValidation && rangeValidation.conflitos.length > 0 ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Range parcialmente disponível: {rangeValidation.cartelas.length} de {parseInt(rangeFim) - parseInt(rangeInicio) + 1} cartelas podem ser retiradas.
                        Conflitos: {rangeValidation.conflitos.join(', ')}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    'cartelas' in rangeValidation && (
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Range disponível: {rangeValidation.cartelas.length} cartela(s) podem ser retiradas.
                        </AlertDescription>
                      </Alert>
                    )
                  )
                ) : (
                  'erro' in rangeValidation && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {rangeValidation.erro}
                      </AlertDescription>
                    </Alert>
                  )
                )}
              </div>
            )}
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
              disabled={retirarCartelas.isPending || cartelasSelecionadas.length === 0}
              className="flex-1"
            >
              {retirarCartelas.isPending ? "Retirando..." : `Retirar ${cartelasSelecionadas.length} Cartela(s)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}