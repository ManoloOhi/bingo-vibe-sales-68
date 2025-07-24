import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BingoService, Bingo } from '@/services/realBingoService';
import { VendedorService, Vendedor } from '@/services/realVendedorService';
import { PedidoService, Pedido } from '@/services/realPedidoService';
import { debugCache } from '@/utils/cacheUtils';

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
    queryFn: () => {
      console.log('🎯 Executando query: bingos');
      return BingoService.list();
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 30,
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
      console.log('🎯 Invalidando cache após criar bingo');
      debugCache();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
      // Invalidar pedidos pois novo bingo pode afetar relacionamentos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
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
      // Invalidar pedidos relacionados ao bingo
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidosByBingo(id) });
    },
  });
};

export const useDeleteBingo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: BingoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
      // Invalidar todos os pedidos pois exclusão de bingo pode afetar
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
    },
  });
};

// ========================================
// 👥 VENDEDORES HOOKS
// ========================================
export const useVendedores = () => {
  return useQuery({
    queryKey: QUERY_KEYS.vendedores,
    queryFn: () => {
      console.log('👥 Executando query: vendedores');
      return VendedorService.list();
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 30,
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
      // Invalidar pedidos pois pode afetar relacionamentos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
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
      // Invalidar pedidos relacionados ao vendedor
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidosByVendedor(id) });
    },
  });
};

export const useDeleteVendedor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => VendedorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendedores });
      // Invalidar todos os pedidos pois inativação de vendedor pode afetar
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
    },
  });
};

// ========================================
// 📦 PEDIDOS HOOKS
// ========================================
export const usePedidos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.pedidos,
    queryFn: () => {
      console.log('📦 Executando query: pedidos');
      return PedidoService.list();
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 30,
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
    queryFn: () => {
      console.log(`📦 Executando query: pedidosByVendedor(${vendedorId})`);
      return PedidoService.findByVendedor(vendedorId);
    },
    enabled: !!vendedorId,
    staleTime: 0,
    gcTime: 1000 * 60 * 30,
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
      // Invalidar TODOS os pedidos e dados relacionados
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.pedidosByVendedor(newPedido.vendedorId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.pedidosByBingo(newPedido.bingoId) 
      });
      // Invalidar vendedores pois pode afetar status ativo/livre
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendedores });
      // Invalidar bingos pois pode afetar cartelas disponíveis
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
    },
  });
};

// ========================================
// 🎫 CARTELAS HOOKS
// ========================================
export const useRetirarCartelas = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pedidoId, cartelas }: { pedidoId: string; cartelas: number[] }) => 
      PedidoService.retirarCartelas(pedidoId, cartelas),
    onSuccess: (updatedPedido) => {
      console.log('🎫 Invalidando cache após retirar cartelas');
      debugCache();
      // Invalidar TODOS os dados relacionados
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
      if (updatedPedido) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedido(updatedPedido.id) });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.pedidosByVendedor(updatedPedido.vendedorId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.pedidosByBingo(updatedPedido.bingoId) 
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendedores });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
    },
  });
};

export const useVenderCartelas = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pedidoId, cartelas }: { pedidoId: string; cartelas: number[] }) => 
      PedidoService.venderCartelas(pedidoId, cartelas),
    onSuccess: (updatedPedido) => {
      // Invalidar TODOS os dados relacionados
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
      if (updatedPedido) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedido(updatedPedido.id) });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.pedidosByVendedor(updatedPedido.vendedorId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.pedidosByBingo(updatedPedido.bingoId) 
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendedores });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
    },
  });
};

export const useDevolverCartelas = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ pedidoId, cartelas }: { pedidoId: string; cartelas: number[] }) => 
      PedidoService.devolverCartelas(pedidoId, cartelas),
    onSuccess: (updatedPedido) => {
      // Invalidar TODOS os dados relacionados
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedidos });
      if (updatedPedido) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pedido(updatedPedido.id) });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.pedidosByVendedor(updatedPedido.vendedorId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.pedidosByBingo(updatedPedido.bingoId) 
        });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendedores });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
    },
  });
};

export const useUpdatePedido = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pedido> }) => 
      PedidoService.update(id, data),
    onSuccess: (updatedPedido, { id }) => {
      // Invalidar TODOS os dados relacionados a pedidos
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
      // Invalidar vendedores pois mudança de status afeta disponibilidade
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.vendedores });
      // Invalidar bingos pois pode afetar cartelas
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bingos });
    },
  });
};

// ========================================
// 🎫 CARTELAS DISPONÍVEIS HOOK
// ========================================
export const useCartelasDisponiveis = (bingoId: string) => {
  const { data: bingo } = useBingo(bingoId);
  const { data: pedidosDoBingo } = usePedidosByBingo(bingoId);
  
  return {
    cartelasDisponiveis: (() => {
      if (!bingo || !pedidosDoBingo) return [];
      
      // Gerar todas as cartelas do bingo baseado no range
      const todasCartelas = new Set<number>();
      for (let i = bingo.rangeInicio; i <= bingo.rangeFim; i++) {
        todasCartelas.add(i);
      }
      
      // Calcular cartelas ocupadas por TODOS os vendedores
      const cartelasOcupadas = new Set<number>();
      const cartelasDevolvidas = new Set<number>();
      
      pedidosDoBingo.forEach(pedido => {
        // Cartelas retiradas (ocupadas)
        pedido.cartelasRetiradas.forEach(cartela => {
          cartelasOcupadas.add(cartela);
        });
        
        // Cartelas devolvidas (liberam as ocupadas)
        pedido.cartelasDevolvidas.forEach(cartela => {
          cartelasDevolvidas.add(cartela);
        });
      });
      
      // Cartelas disponíveis = Todas - (Ocupadas - Devolvidas)
      const disponiveis = Array.from(todasCartelas).filter(cartela => {
        const estaOcupada = cartelasOcupadas.has(cartela);
        const foiDevolvida = cartelasDevolvidas.has(cartela);
        // Disponível se nunca foi retirada OU se foi devolvida
        return !estaOcupada || foiDevolvida;
      });
      
      return disponiveis.sort((a, b) => a - b);
    })(),
    
    estatisticas: (() => {
      if (!bingo || !pedidosDoBingo) return null;
      
      const totalCartelas = bingo.rangeFim - bingo.rangeInicio + 1;
      
      const cartelasRetiradas = new Set<number>();
      const cartelasDevolvidas = new Set<number>();
      
      pedidosDoBingo.forEach(pedido => {
        pedido.cartelasRetiradas.forEach(cartela => cartelasRetiradas.add(cartela));
        pedido.cartelasDevolvidas.forEach(cartela => cartelasDevolvidas.add(cartela));
      });
      
      const ocupadas = cartelasRetiradas.size - cartelasDevolvidas.size;
      const disponiveis = totalCartelas - ocupadas;
      
      return {
        total: totalCartelas,
        disponiveis,
        ocupadas,
        devolvidas: cartelasDevolvidas.size
      };
    })(),
    
    validarRange: (inicio: number, fim: number) => {
      if (!bingo || !pedidosDoBingo) return { valido: false, cartelas: [], conflitos: [] };
      
      const rangeCartelas = [];
      for (let i = inicio; i <= fim; i++) {
        rangeCartelas.push(i);
      }
      
      const cartelasOcupadas = new Set<number>();
      const cartelasDevolvidas = new Set<number>();
      
      pedidosDoBingo.forEach(pedido => {
        pedido.cartelasRetiradas.forEach(cartela => cartelasOcupadas.add(cartela));
        pedido.cartelasDevolvidas.forEach(cartela => cartelasDevolvidas.add(cartela));
      });
      
      const cartelasDisponiveis = rangeCartelas.filter(cartela => {
        const estaOcupada = cartelasOcupadas.has(cartela);
        const foiDevolvida = cartelasDevolvidas.has(cartela);
        return !estaOcupada || foiDevolvida;
      });
      
      const conflitos = rangeCartelas.filter(cartela => {
        const estaOcupada = cartelasOcupadas.has(cartela);
        const foiDevolvida = cartelasDevolvidas.has(cartela);
        return estaOcupada && !foiDevolvida;
      });
      
      return {
        valido: conflitos.length === 0,
        cartelas: cartelasDisponiveis,
        conflitos
      };
    }
  };
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