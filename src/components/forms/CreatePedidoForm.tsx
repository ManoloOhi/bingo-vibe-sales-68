import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { BingoService } from '@/services/realBingoService';
import { useToast } from '@/hooks/use-toast';
import { useCreatePedido, useVendedores, useBingos } from '@/hooks/useQueryData';
import type { NewPedido } from '@/services/realPedidoService';

interface CreatePedidoFormProps {
  onPedidoCreated?: () => void;
}

export function CreatePedidoForm({ onPedidoCreated }: CreatePedidoFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendedorId: '',
    bingoId: '',
    quantidade: ''
  });
  const { toast } = useToast();
  const { data: vendedores = [] } = useVendedores();
  const { data: bingos = [] } = useBingos();
  const createPedido = useCreatePedido();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const quantidade = parseInt(formData.quantidade);
      
      if (quantidade <= 0) {
        toast({
          title: "Erro",
          description: "Quantidade deve ser maior que zero",
          variant: "destructive"
        });
        return;
      }

      const bingo = bingos.find(b => b.id === formData.bingoId);
      if (!bingo) {
        toast({
          title: "Erro",
          description: "Bingo não encontrado",
          variant: "destructive"
        });
        return;
      }

      const cartelasDisponiveis = await BingoService.getCartelasDisponiveis(bingo.id);
      
      if (quantidade > cartelasDisponiveis.length) {
        toast({
          title: "Erro",
          description: `Apenas ${cartelasDisponiveis.length} cartelas disponíveis`,
          variant: "destructive"
        });
        return;
      }

      const pedidoData: Omit<NewPedido, 'id' | 'createdAt' | 'updatedAt'> = {
        bingoId: formData.bingoId,
        vendedorId: formData.vendedorId,
        quantidade,
        status: 'aberto'
      };

      await createPedido.mutateAsync(pedidoData);

      toast({
        title: "Sucesso!",
        description: `Pedido criado com ${quantidade} cartelas`
      });

      setFormData({ vendedorId: '', bingoId: '', quantidade: '' });
      setOpen(false);
      onPedidoCreated?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar pedido",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-primary to-primary-glow">
          <Plus size={18} />
          Novo Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Vendedor</Label>
            <Select value={formData.vendedorId} onValueChange={(value) => setFormData(prev => ({ ...prev, vendedorId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um vendedor" />
              </SelectTrigger>
              <SelectContent>
                {vendedores.map((vendedor) => (
                  <SelectItem key={vendedor.id} value={vendedor.id}>
                    {vendedor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bingo</Label>
            <Select value={formData.bingoId} onValueChange={(value) => setFormData(prev => ({ ...prev, bingoId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um bingo" />
              </SelectTrigger>
              <SelectContent>
                {bingos.map((bingo) => (
                  <SelectItem key={bingo.id} value={bingo.id}>
                    {bingo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade de Cartelas</Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              value={formData.quantidade}
              onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
              placeholder="Ex: 50"
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
              disabled={createPedido.isPending || !formData.vendedorId || !formData.bingoId}
              className="flex-1"
            >
              {createPedido.isPending ? "Criando..." : "Criar Pedido"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}