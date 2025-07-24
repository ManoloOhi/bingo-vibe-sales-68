import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BingoService, Bingo } from '@/services/realBingoService';
import { VendedorService, Vendedor } from '@/services/realVendedorService';
import { PedidoService, Pedido } from '@/services/realPedidoService';
import { ApiService } from '@/services/apiService';
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
      const cartelasVendidas = new Set<number>();
      const cartelasDevolvidas = new Set<number>();
      
      pedidosDoBingo.forEach(pedido => {
        // Cartelas retiradas (ocupadas temporariamente)
        pedido.cartelasRetiradas.forEach(cartela => {
          cartelasOcupadas.add(cartela);
        });
        
        // Cartelas vendidas (ocupadas permanentemente)
        pedido.cartelasVendidas.forEach(cartela => {
          cartelasVendidas.add(cartela);
        });
        
        // Cartelas devolvidas (liberam apenas as retiradas, não as vendidas)
        pedido.cartelasDevolvidas.forEach(cartela => {
          cartelasDevolvidas.add(cartela);
        });
      });
      
      // Cartelas disponíveis = Todas - (Ocupadas - Devolvidas) - Vendidas
      const disponiveis = Array.from(todasCartelas).filter(cartela => {
        const estaOcupada = cartelasOcupadas.has(cartela);
        const foiVendida = cartelasVendidas.has(cartela);
        const foiDevolvida = cartelasDevolvidas.has(cartela);
        
        // Não disponível se foi vendida (permanente)
        if (foiVendida) return false;
        
        // Disponível se nunca foi retirada OU se foi devolvida
        return !estaOcupada || foiDevolvida;
      });
      
      return disponiveis.sort((a, b) => a - b);
    })(),
    
    cartelasIndisponiveis: (() => {
      if (!bingo || !pedidosDoBingo) return [];
      
      const cartelasOcupadas = new Set<number>();
      const cartelasVendidas = new Set<number>();
      const cartelasDevolvidas = new Set<number>();
      
      pedidosDoBingo.forEach(pedido => {
        pedido.cartelasRetiradas.forEach(cartela => cartelasOcupadas.add(cartela));
        pedido.cartelasVendidas.forEach(cartela => cartelasVendidas.add(cartela));
        pedido.cartelasDevolvidas.forEach(cartela => cartelasDevolvidas.add(cartela));
      });
      
      // Cartelas indisponíveis = (ocupadas - devolvidas) + vendidas
      const retiradas = Array.from(cartelasOcupadas).filter(cartela => 
        !cartelasDevolvidas.has(cartela)
      );
      const vendidas = Array.from(cartelasVendidas);
      const indisponiveis = [...new Set([...retiradas, ...vendidas])].sort((a, b) => a - b);
      
      return indisponiveis;
    })(),
    
    rangesIndisponiveis: (() => {
      if (!bingo || !pedidosDoBingo) return [];
      
      const cartelasOcupadas = new Set<number>();
      const cartelasVendidas = new Set<number>();
      const cartelasDevolvidas = new Set<number>();
      
      pedidosDoBingo.forEach(pedido => {
        pedido.cartelasRetiradas.forEach(cartela => cartelasOcupadas.add(cartela));
        pedido.cartelasVendidas.forEach(cartela => cartelasVendidas.add(cartela));
        pedido.cartelasDevolvidas.forEach(cartela => cartelasDevolvidas.add(cartela));
      });
      
      // Cartelas indisponíveis = (ocupadas - devolvidas) + vendidas
      const retiradas = Array.from(cartelasOcupadas).filter(cartela => 
        !cartelasDevolvidas.has(cartela)
      );
      const vendidas = Array.from(cartelasVendidas);
      const indisponiveis = [...new Set([...retiradas, ...vendidas])].sort((a, b) => a - b);
      
      if (indisponiveis.length === 0) return [];
      
      // Agrupar números consecutivos em ranges
      const ranges: string[] = [];
      let inicio = indisponiveis[0];
      let fim = indisponiveis[0];
      
      for (let i = 1; i < indisponiveis.length; i++) {
        if (indisponiveis[i] === fim + 1) {
          fim = indisponiveis[i];
        } else {
          // Finalizar range atual
          if (inicio === fim) {
            ranges.push(inicio.toString());
          } else {
            ranges.push(`${inicio}-${fim}`);
          }
          inicio = indisponiveis[i];
          fim = indisponiveis[i];
        }
      }
      
      // Adicionar último range
      if (inicio === fim) {
        ranges.push(inicio.toString());
      } else {
        ranges.push(`${inicio}-${fim}`);
      }
      
      return ranges;
    })(),
    
    validarRange: (inicio: number, fim: number) => {
      if (!bingo || !pedidosDoBingo) return { valido: false, cartelas: [], conflitos: [] };
      
      const rangeCartelas = [];
      for (let i = inicio; i <= fim; i++) {
        rangeCartelas.push(i);
      }
      
      const cartelasOcupadas = new Set<number>();
      const cartelasVendidas = new Set<number>();
      const cartelasDevolvidas = new Set<number>();
      
      pedidosDoBingo.forEach(pedido => {
        pedido.cartelasRetiradas.forEach(cartela => cartelasOcupadas.add(cartela));
        pedido.cartelasVendidas.forEach(cartela => cartelasVendidas.add(cartela));
        pedido.cartelasDevolvidas.forEach(cartela => cartelasDevolvidas.add(cartela));
      });
      
      const cartelasDisponiveis = rangeCartelas.filter(cartela => {
        const estaOcupada = cartelasOcupadas.has(cartela);
        const foiVendida = cartelasVendidas.has(cartela);
        const foiDevolvida = cartelasDevolvidas.has(cartela);
        
        // Não disponível se foi vendida (permanente)
        if (foiVendida) return false;
        
        // Disponível se nunca foi retirada OU se foi devolvida
        return !estaOcupada || foiDevolvida;
      });
      
      const conflitos = rangeCartelas.filter(cartela => {
        const estaOcupada = cartelasOcupadas.has(cartela);
        const foiVendida = cartelasVendidas.has(cartela);
        const foiDevolvida = cartelasDevolvidas.has(cartela);
        
        // Conflito se foi vendida OU se está ocupada e não foi devolvida
        return foiVendida || (estaOcupada && !foiDevolvida);
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
// 📊 DASHBOARD & RELATÓRIOS HOOKS
// ========================================
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => ApiService.getDashboardStats(),
    staleTime: 1 * 60 * 1000, // 1 minuto
  });
};

export const useBingoRelatorio = (bingoId: string) => {
  return useQuery({
    queryKey: ['bingo', bingoId, 'relatorio'],
    queryFn: () => ApiService.getBingoRelatorio(bingoId),
    enabled: !!bingoId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useBingoCartelasDisponiveis = (bingoId: string) => {
  return useQuery({
    queryKey: ['bingo', bingoId, 'cartelas', 'disponiveis'],
    queryFn: () => ApiService.getBingoCartelasDisponiveis(bingoId),
    enabled: !!bingoId,
    staleTime: 30 * 1000, // 30 segundos
  });
};

export const useBingoCartelasVendidas = (bingoId: string) => {
  return useQuery({
    queryKey: ['bingo', bingoId, 'cartelas', 'vendidas'],
    queryFn: () => ApiService.getBingoCartelasVendidas(bingoId),
    enabled: !!bingoId,
    staleTime: 1 * 60 * 1000, // 1 minuto
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