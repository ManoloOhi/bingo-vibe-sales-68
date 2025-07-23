import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { PedidoService } from '@/services/pedidoService';
import { VendedorService } from '@/services/vendedorService';
import { BingoService } from '@/services/bingoService';
import { useToast } from '@/hooks/use-toast';
import type { Pedido } from '@/db/schema';
import type { Vendedor } from '@/db/schema';
import type { Bingo } from '@/db/schema';

interface EditPedidoFormProps {
  pedido: Pedido;
  onPedidoUpdated?: () => void;
}

export function EditPedidoForm({ pedido, onPedidoUpdated }: EditPedidoFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [bingos, setBingos] = useState<Bingo[]>([]);
  const [formData, setFormData] = useState({
    vendedorId: pedido.vendedorId,
    bingoId: pedido.bingoId,
    quantidade: pedido.quantidade.toString()
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vendedoresData, bingosData] = await Promise.all([
          VendedorService.list(),
          BingoService.list()
        ]);
        setVendedores(vendedoresData);
        setBingos(bingosData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    if (open) {
      loadData();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        vendedorId: formData.vendedorId,
        bingoId: formData.bingoId,
        quantidade: parseInt(formData.quantidade)
      };

      await PedidoService.update(pedido.id, updateData);

      toast({
        title: "Sucesso!",
        description: "Pedido atualizado com sucesso"
      });

      setOpen(false);
      onPedidoUpdated?.();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar pedido",
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
          <Edit size={16} />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Pedido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendedorId">Vendedor</Label>
            <Select
              value={formData.vendedorId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, vendedorId: value }))}
            >
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
            <Label htmlFor="bingoId">Bingo</Label>
            <Select
              value={formData.bingoId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, bingoId: value }))}
            >
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
              placeholder="10"
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
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}