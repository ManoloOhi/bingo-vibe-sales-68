import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { PedidoService } from '@/services/realPedidoService';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import type { Pedido } from '@/services/realPedidoService';

interface DeletePedidoFormProps {
  pedido: Pedido;
}

export function DeletePedidoForm({ pedido }: DeletePedidoFormProps) {
  const queryClient = useQueryClient();

  const cartelasPendentes = pedido.cartelasPendentes || [];
  const podeExcluir = cartelasPendentes.length === 0;

  const handleDelete = async () => {
    try {
      await PedidoService.delete(pedido.id);
      
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['bingos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      toast.success('Pedido excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error(`Erro ao excluir pedido: ${message}`);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm"
          disabled={!podeExcluir}
          title={!podeExcluir ? 'Não é possível excluir pedido com cartelas pendentes' : 'Excluir pedido'}
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            {podeExcluir ? (
              <>
                Tem certeza que deseja excluir este pedido?
                <br />
                <strong>Esta ação não pode ser desfeita.</strong>
              </>
            ) : (
              <>
                <span className="text-destructive font-medium">
                  Não é possível excluir este pedido!
                </span>
                <br />
                <br />
                Este pedido possui {cartelasPendentes.length} cartela{cartelasPendentes.length > 1 ? 's' : ''} pendente{cartelasPendentes.length > 1 ? 's' : ''}:
                <br />
                <strong>{cartelasPendentes.join(', ')}</strong>
                <br />
                <br />
                Todas as cartelas retiradas devem estar vendidas ou devolvidas antes da exclusão.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {podeExcluir && (
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}