import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUpdateBingo } from '@/hooks/useQueryData';
import type { Bingo } from '@/services/realBingoService';

interface EditBingoFormProps {
  bingo: Bingo;
  onBingoUpdated?: () => void;
}

export function EditBingoForm({ bingo, onBingoUpdated }: EditBingoFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: bingo.nome,
    quantidadeCartelas: bingo.quantidadeCartelas.toString(),
    rangeInicio: bingo.rangeInicio.toString(),
    rangeFim: bingo.rangeFim.toString(),
    valorCartela: bingo.valorCartela,
    dataBingo: bingo.dataBingo instanceof Date ? bingo.dataBingo.toISOString().split('T')[0] : new Date(bingo.dataBingo).toISOString().split('T')[0]
  });
  const { toast } = useToast();
  const updateBingo = useUpdateBingo();

  // Auto-update quantidade when range changes
  useEffect(() => {
    const inicio = parseInt(formData.rangeInicio);
    const fim = parseInt(formData.rangeFim);
    
    if (!isNaN(inicio) && !isNaN(fim) && inicio < fim) {
      const quantidade = fim - inicio + 1;
      setFormData(prev => ({ ...prev, quantidadeCartelas: quantidade.toString() }));
    }
  }, [formData.rangeInicio, formData.rangeFim]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const rangeInicio = parseInt(formData.rangeInicio);
      const rangeFim = parseInt(formData.rangeFim);
      const quantidadeCartelas = parseInt(formData.quantidadeCartelas);

      if (rangeInicio >= rangeFim) {
        throw new Error('Range inválido: início deve ser menor que fim');
      }

      const quantidadeCalculada = rangeFim - rangeInicio + 1;
      if (quantidadeCartelas !== quantidadeCalculada) {
        throw new Error(`Quantidade de cartelas (${quantidadeCartelas}) não confere com o range (${quantidadeCalculada})`);
      }

      const bingoData = {
        nome: formData.nome,
        quantidadeCartelas,
        rangeInicio,
        rangeFim,
        valorCartela: formData.valorCartela,
        dataBingo: new Date(formData.dataBingo)
      };

      await updateBingo.mutateAsync({ id: bingo.id, data: bingoData });

      toast({
        title: "Sucesso!",
        description: "Bingo atualizado com sucesso"
      });

      setOpen(false);
      onBingoUpdated?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar bingo",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit size={16} />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Bingo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Bingo</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Bingo da Igreja"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rangeInicio">Início</Label>
              <Input
                id="rangeInicio"
                type="number"
                value={formData.rangeInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, rangeInicio: e.target.value }))}
                placeholder="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rangeFim">Fim</Label>
              <Input
                id="rangeFim"
                type="number"
                value={formData.rangeFim}
                onChange={(e) => setFormData(prev => ({ ...prev, rangeFim: e.target.value }))}
                placeholder="100"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidadeCartelas">Quantidade de Cartelas</Label>
            <Input
              id="quantidadeCartelas"
              type="number"
              value={formData.quantidadeCartelas}
              placeholder="100"
              disabled
              className="bg-muted text-muted-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valorCartela">Valor por Cartela (R$)</Label>
            <Input
              id="valorCartela"
              value={formData.valorCartela}
              onChange={(e) => setFormData(prev => ({ ...prev, valorCartela: e.target.value }))}
              placeholder="5.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataBingo">Data do Bingo</Label>
            <Input
              id="dataBingo"
              type="date"
              value={formData.dataBingo}
              onChange={(e) => setFormData(prev => ({ ...prev, dataBingo: e.target.value }))}
              required
            />
          </div>

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
              disabled={updateBingo.isPending}
              className="flex-1"
            >
              {updateBingo.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}