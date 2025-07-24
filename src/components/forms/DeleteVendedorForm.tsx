import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useDeleteVendedor } from '@/hooks/useQueryData'
import { useToast } from '@/hooks/use-toast'
import type { Vendedor } from '@/services/realVendedorService'

interface DeleteVendedorFormProps {
  vendedor: Vendedor
  pedidosAtivos: number
  onVendedorDeleted?: () => void
}

export function DeleteVendedorForm({ vendedor, pedidosAtivos, onVendedorDeleted }: DeleteVendedorFormProps) {
  const [open, setOpen] = useState(false)
  const deleteVendedor = useDeleteVendedor()
  const { toast } = useToast()

  const canDelete = pedidosAtivos === 0 && vendedor.ativo

  const handleDelete = async () => {
    try {
      await deleteVendedor.mutateAsync(vendedor.id)
      
      toast({
        title: "Vendedor inativado",
        description: `${vendedor.nome} foi inativado com sucesso.`,
      })
      
      setOpen(false)
      onVendedorDeleted?.()
    } catch (error: any) {
      console.error('Erro ao inativar vendedor:', error)
      
      // Tratar erro específico de pedidos ativos
      if (error?.message?.includes('pedidos ativos')) {
        toast({
          title: "Não é possível inativar",
          description: `O vendedor possui ${pedidosAtivos} pedidos ativos. Finalize ou cancele os pedidos antes de inativar.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível inativar o vendedor. Tente novamente.",
          variant: "destructive",
        })
      }
    }
  }

  if (!canDelete) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="opacity-50"
        title={!vendedor.ativo ? "Vendedor já está inativo" : "Finalize os pedidos ativos para inativar"}
      >
        <Trash2 size={16} />
        Inativar
      </Button>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 size={16} />
          Inativar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Inativar Vendedor</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja inativar <strong>{vendedor.nome}</strong>?
            <br />
            Esta ação pode ser revertida editando o vendedor posteriormente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteVendedor.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteVendedor.isPending ? "Inativando..." : "Inativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}