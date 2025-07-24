import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Minus, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRetirarCartelas, useCartelasDisponiveis, useBingoEstoque } from '@/hooks/useQueryData';
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
  const [cartelaIndividual, setCartelaIndividual] = useState('');
  const { toast } = useToast();
  const retirarCartelas = useRetirarCartelas();
  const { data: estoque } = useBingoEstoque(pedido.bingoId);
  
  // Usar o novo hook para cartelas disponíveis
  const { cartelasDisponiveis, rangesIndisponiveis, validarRange } = useCartelasDisponiveis(pedido.bingoId);

  // Validação em tempo real do range - REMOVENDO RESTRIÇÃO SEQUENCIAL
  const rangeValidation = (() => {
    if (!rangeInicio || !rangeFim) return null;
    
    const inicio = parseInt(rangeInicio);
    const fim = parseInt(rangeFim);
    
    if (isNaN(inicio) || isNaN(fim)) return null;
    // REMOVIDO: if (inicio > fim) return { valido: false, erro: 'Início deve ser menor que fim' };
    
    // Se início > fim, trocar os valores automaticamente
    const menor = Math.min(inicio, fim);
    const maior = Math.max(inicio, fim);
    
    return validarRange(menor, maior);
  })();

  const adicionarRange = () => {
    if (!rangeValidation || !rangeValidation.valido) {
      if (rangeValidation && 'erro' in rangeValidation) {
        toast({
          title: "Erro no range",
          description: String(rangeValidation.erro),
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

  const adicionarCartelaIndividual = () => {
    if (!cartelaIndividual) return;
    
    const numeroCartela = parseInt(cartelaIndividual);
    if (isNaN(numeroCartela)) {
      toast({
        title: "Erro",
        description: "Digite um número válido",
        variant: "destructive"
      });
      return;
    }

    // Verificar se a cartela está disponível
    const resultado = validarRange(numeroCartela, numeroCartela);
    if (!resultado.valido) {
      toast({
        title: "Cartela indisponível",
        description: `A cartela ${numeroCartela} não está disponível`,
        variant: "destructive"
      });
      return;
    }

    if (cartelasSelecionadas.includes(numeroCartela)) {
      toast({
        title: "Aviso",
        description: "Esta cartela já está selecionada",
        variant: "default"
      });
      return;
    }

    setCartelasSelecionadas(prev => [...prev, numeroCartela].sort((a, b) => a - b));
    setCartelaIndividual('');
  };

  const adicionarCartelasAleatorias = (quantidade: number) => {
    // Verificar estoque disponível
    const estoqueDisponivel = estoque?.estoque || 0;
    if (estoqueDisponivel === 0) {
      toast({
        title: "Estoque esgotado",
        description: "Não há cartelas disponíveis em estoque",
        variant: "destructive"
      });
      return;
    }

    if (!cartelasDisponiveis || cartelasDisponiveis.length === 0) {
      toast({
        title: "Erro",
        description: "Não há cartelas disponíveis",
        variant: "destructive"
      });
      return;
    }

    // Filtrar cartelas que ainda não foram selecionadas
    const cartelasNaoSelecionadas = cartelasDisponiveis.filter(
      cartela => !cartelasSelecionadas.includes(cartela)
    );

    if (cartelasNaoSelecionadas.length === 0) {
      toast({
        title: "Aviso",
        description: "Todas as cartelas disponíveis já estão selecionadas",
        variant: "default"
      });
      return;
    }

    // Limitar pela menor quantidade entre: solicitado, disponível ou estoque
    const quantidadeParaAdicionar = Math.min(quantidade, cartelasNaoSelecionadas.length, estoqueDisponivel);
    
    // Embaralhar e pegar as primeiras N cartelas
    const cartelasAleatorias = [...cartelasNaoSelecionadas]
      .sort(() => Math.random() - 0.5)
      .slice(0, quantidadeParaAdicionar);

    setCartelasSelecionadas(prev => [...prev, ...cartelasAleatorias].sort((a, b) => a - b));
    
    toast({
      title: "Cartelas adicionadas",
      description: `${quantidadeParaAdicionar} cartela(s) aleatória(s) adicionada(s)`,
      variant: "default"
    });
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

    // Verificar estoque antes de enviar
    const estoqueDisponivel = estoque?.estoque || 0;
    if (cartelasSelecionadas.length > estoqueDisponivel) {
      toast({
        title: "Estoque insuficiente",
        description: `Só há ${estoqueDisponivel} cartelas disponíveis em estoque`,
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
          {/* Status do Estoque */}
          <div className="bg-muted/50 border p-4 rounded-lg">
            <div className="text-sm font-medium mb-2">
              Status do Estoque
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Disponível: </span>
                <span className={`font-medium ${(estoque?.estoque || 0) === 0 ? 'text-destructive' : 'text-success'}`}>
                  {estoque?.estoque || 0} cartelas
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Pendente: </span>
                <span className="font-medium">{estoque?.pendente || 0}</span>
              </div>
            </div>
          </div>

          {/* Cartelas Indisponíveis */}
          {rangesIndisponiveis.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <div className="text-sm font-medium text-destructive mb-2">
                Cartelas Indisponíveis
              </div>
              <div className="flex flex-wrap gap-1">
                {rangesIndisponiveis.map((range, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md bg-destructive/20 text-destructive text-xs font-medium"
                  >
                    {range}
                  </span>
                ))}
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
                         {String(rangeValidation.erro)}
                       </AlertDescription>
                     </Alert>
                   )
                 )}
              </div>
            )}
           </div>

          {/* Seleção Individual */}
          <div className="space-y-3">
            <Label>Adicionar Cartela Individual</Label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Número da cartela"
                  value={cartelaIndividual}
                  onChange={(e) => setCartelaIndividual(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={adicionarCartelaIndividual}
                disabled={!cartelaIndividual}
              >
                Adicionar
              </Button>
            </div>
          </div>

          {/* Seleção Aleatória */}
          <div className="space-y-3">
            <Label>Adicionar Cartelas Aleatórias</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adicionarCartelasAleatorias(5)}
                disabled={!cartelasDisponiveis || cartelasDisponiveis.length === 0 || (estoque?.estoque || 0) === 0}
              >
                +5 Aleatórias
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adicionarCartelasAleatorias(10)}
                disabled={!cartelasDisponiveis || cartelasDisponiveis.length === 0 || (estoque?.estoque || 0) === 0}
              >
                +10 Aleatórias
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => adicionarCartelasAleatorias(20)}
                disabled={!cartelasDisponiveis || cartelasDisponiveis.length === 0 || (estoque?.estoque || 0) === 0}
              >
                +20 Aleatórias
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCartelasSelecionadas([])}
                disabled={cartelasSelecionadas.length === 0}
              >
                Limpar Todas
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
              disabled={
                retirarCartelas.isPending || 
                cartelasSelecionadas.length === 0 || 
                cartelasSelecionadas.length > (estoque?.estoque || 0)
              }
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