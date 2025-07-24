import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BingoService, Bingo } from '@/services/realBingoService';
import { VendedorService, Vendedor } from '@/services/realVendedorService';
import { PedidoService, Pedido } from '@/services/realPedidoService';

// ========================================
// 🗝️ QUERY KEYS
// ========================================
export const QUERY_KEYS = {
  bingos: ['bingos'] as const,
  bingo: (id: string) => ['bingos', id] as const,
  vendedores: ['vendedores'] as const,
  vendedor: (id: string) => ['vendedores', id] as const,
  pedidos: ['pedidos'] as const,
  pedido: (id: string) => ['pedidos', id] as const,
  pedidosByVendedor: (vendedorId: string) => ['pedidos', 'vendedor', vendedorId] as const,
  pedidosByBingo: (bingoId: string) => ['pedidos', 'bingo', bingoId] as const,
} as const;

// ========================================
// 🎯 BINGOS HOOKS
// ========================================
export const useBingos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.bingos,
    queryFn: BingoService.list,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useBingo = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.bingo(id),
    queryFn: () => BingoService.findById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateBingo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: BingoService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
    },
  });
};

export const useUpdateBingo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Bingo> }) => 
      BingoService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingo(id) });
    },
  });
};

export const useDeleteBingo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: BingoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
    },
  });
};

// ========================================
// 👥 VENDEDORES HOOKS
// ========================================
export const useVendedores = () => {
  return useQuery({
    queryKey: QUERY_KEYS.vendedores,
    queryFn: VendedorService.list,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useVendedor = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.vendedor(id),
    queryFn: () => VendedorService.findById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateVendedor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: VendedorService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendedores });
    },
  });
};

export const useUpdateVendedor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vendedor> }) => 
      VendedorService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendedores });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendedor(id) });
    },
  });
};

// ========================================
// 📦 PEDIDOS HOOKS
// ========================================
export const usePedidos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.pedidos,
    queryFn: PedidoService.list,
    staleTime: 2 * 60 * 1000, // 2 minutos (dados mais dinâmicos)
    gcTime: 5 * 60 * 1000,
  });
};

export const usePedido = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.pedido(id),
    queryFn: () => PedidoService.findById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const usePedidosByVendedor = (vendedorId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.pedidosByVendedor(vendedorId),
    queryFn: () => PedidoService.findByVendedor(vendedorId),
    enabled: !!vendedorId,
    staleTime: 2 * 60 * 1000,
  });
};

export const usePedidosByBingo = (bingoId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.pedidosByBingo(bingoId),
    queryFn: () => PedidoService.findByBingo(bingoId),
    enabled: !!bingoId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreatePedido = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: PedidoService.create,
    onSuccess: (newPedido) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.pedidosByVendedor(newPedido.vendedorId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.pedidosByBingo(newPedido.bingoId) 
      });
    },
  });
};

export const useUpdatePedido = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pedido> }) => 
      PedidoService.update(id, data),
    onSuccess: (updatedPedido, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedido(id) });
      if (updatedPedido) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.pedidosByVendedor(updatedPedido.vendedorId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.pedidosByBingo(updatedPedido.bingoId) 
        });
      }
    },
  });
};

// ========================================
// 🔄 INVALIDATION UTILITIES
// ========================================
export const useInvalidateAll = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendedores });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
    },
    invalidateBingos: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
    },
    invalidateVendedores: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendedores });
    },
    invalidatePedidos: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
    },
  };
};