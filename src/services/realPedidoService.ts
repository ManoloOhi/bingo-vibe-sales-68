import { ApiService } from './apiService';

export interface Pedido {
  id: string;
  bingoId: string;
  vendedorId: string;
  quantidade: number;
  cartelasRetiradas: number[];
  cartelasPendentes: number[];
  cartelasVendidas: number[];
  cartelasDevolvidas: number[];
  status: 'aberto' | 'fechado' | 'cancelado';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NewPedido {
  bingoId: string;
  vendedorId: string;
  quantidade: number;
  status?: 'aberto' | 'fechado' | 'cancelado';
}

export class PedidoService {
  static async list(): Promise<Pedido[]> {
    return ApiService.getPedidos();
  }

  static async findById(id: string): Promise<Pedido | null> {
    return ApiService.getPedido(id);
  }

  static async findByVendedor(vendedorId: string): Promise<Pedido[]> {
    const pedidos = await this.list();
    return pedidos.filter(p => p.vendedorId === vendedorId);
  }

  static async findByBingo(bingoId: string): Promise<Pedido[]> {
    const pedidos = await this.list();
    return pedidos.filter(p => p.bingoId === bingoId);
  }

  static async create(pedidoData: Omit<NewPedido, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pedido> {
    // Validações básicas
    if (pedidoData.quantidade > 500) {
      throw new Error('Máximo de 500 cartelas por pedido');
    }

    const pedidoCompleto = {
      ...pedidoData,
      cartelasRetiradas: [],
      cartelasPendentes: [],
      cartelasVendidas: [],
      cartelasDevolvidas: [],
      status: pedidoData.status || 'aberto' as const
    };

    return ApiService.createPedido(pedidoCompleto);
  }

  static async update(id: string, pedidoData: Partial<Pedido>): Promise<Pedido | null> {
    try {
      return await ApiService.updatePedido(id, pedidoData);
    } catch (error) {
      return null;
    }
  }

  static async retirarCartelas(pedidoId: string, cartelas: number[]): Promise<Pedido | null> {
    const pedido = await this.findById(pedidoId);
    if (!pedido) throw new Error('Pedido não encontrado');

    // VALIDAÇÃO: Verificar se as cartelas estão realmente disponíveis
    const todosPedidosDoBingo = await this.findByBingo(pedido.bingoId);
    const cartelasOcupadas = new Set<number>();
    const cartelasJaDevolvidas = new Set<number>();
    
    todosPedidosDoBingo.forEach(p => {
      p.cartelasRetiradas.forEach(cartela => cartelasOcupadas.add(cartela));
      p.cartelasDevolvidas.forEach(cartela => cartelasJaDevolvidas.add(cartela));
    });
    
    // Verificar se alguma cartela está ocupada e não foi devolvida
    const cartelasIndisponiveis = cartelas.filter(cartela => {
      const estaOcupada = cartelasOcupadas.has(cartela);  
      const foiDevolvida = cartelasJaDevolvidas.has(cartela);
      return estaOcupada && !foiDevolvida;
    });
    
    if (cartelasIndisponiveis.length > 0) {
      throw new Error(`Cartelas não disponíveis: ${cartelasIndisponiveis.join(', ')}. Elas já foram retiradas por outro vendedor.`);
    }
    
    // Verificar se alguma cartela já foi retirada pelo próprio vendedor
    const cartelasJaRetiradas = cartelas.filter(cartela => 
      pedido.cartelasRetiradas.includes(cartela)
    );
    
    if (cartelasJaRetiradas.length > 0) {
      throw new Error(`Cartelas já retiradas por este vendedor: ${cartelasJaRetiradas.join(', ')}`);
    }

    // Atualizar pedido com TODOS os dados para evitar sobrescrita
    const cartelasRetiradas = [...pedido.cartelasRetiradas, ...cartelas];
    const cartelasPendentes = [...pedido.cartelasPendentes, ...cartelas];
    
    // Remover cartelas re-retiradas de devolvidas (se existirem)
    const cartelasDevolvidas = pedido.cartelasDevolvidas.filter(c => !cartelas.includes(c));

    return this.update(pedidoId, {
      bingoId: pedido.bingoId,
      vendedorId: pedido.vendedorId,
      quantidade: pedido.quantidade,
      cartelasRetiradas,
      cartelasPendentes,
      cartelasVendidas: pedido.cartelasVendidas, // Preservar vendidas
      cartelasDevolvidas, // Remover cartelas re-retiradas
      status: pedido.status
    });
  }

  static async venderCartelas(pedidoId: string, cartelas: number[]): Promise<Pedido | null> {
    const pedido = await this.findById(pedidoId);
    if (!pedido) throw new Error('Pedido não encontrado');

    // Verificar se todas as cartelas estão pendentes
    const cartelasInvalidas = cartelas.filter(c => !pedido.cartelasPendentes.includes(c));
    if (cartelasInvalidas.length > 0) {
      throw new Error(`Cartelas não disponíveis para venda: ${cartelasInvalidas.join(', ')}`);
    }

    // Remover cartelas de pendentes e retiradas, adicionar às vendidas
    const cartelasPendentes = pedido.cartelasPendentes.filter(c => !cartelas.includes(c));
    const cartelasRetiradas = pedido.cartelasRetiradas.filter(c => !cartelas.includes(c));
    const cartelasVendidas = [...pedido.cartelasVendidas, ...cartelas];

    return this.update(pedidoId, {
      bingoId: pedido.bingoId,
      vendedorId: pedido.vendedorId,
      quantidade: pedido.quantidade,
      cartelasRetiradas,
      cartelasPendentes,
      cartelasVendidas,
      cartelasDevolvidas: pedido.cartelasDevolvidas, // Preservar devolvidas
      status: pedido.status
    });
  }

  static async devolverCartelas(pedidoId: string, cartelas: number[]): Promise<Pedido | null> {
    const pedido = await this.findById(pedidoId);
    if (!pedido) throw new Error('Pedido não encontrado');

    // Verificar se todas as cartelas são APENAS pendentes (não vendidas) e não foram devolvidas
    const cartelasInvalidas = cartelas.filter(c => 
      !pedido.cartelasPendentes.includes(c) || 
      pedido.cartelasVendidas.includes(c) || 
      pedido.cartelasDevolvidas.includes(c)
    );
    
    if (cartelasInvalidas.length > 0) {
      throw new Error(`Cartelas não podem ser devolvidas: ${cartelasInvalidas.join(', ')}. Apenas cartelas pendentes podem ser devolvidas.`);
    }

    // Remover cartelas de pendentes e retiradas, adicionar às devolvidas
    const cartelasPendentes = pedido.cartelasPendentes.filter(c => !cartelas.includes(c));
    const cartelasRetiradas = pedido.cartelasRetiradas.filter(c => !cartelas.includes(c));
    const cartelasDevolvidas = [...pedido.cartelasDevolvidas, ...cartelas];

    return this.update(pedidoId, {
      bingoId: pedido.bingoId,
      vendedorId: pedido.vendedorId,
      quantidade: pedido.quantidade,
      cartelasRetiradas,
      cartelasPendentes,
      cartelasVendidas: pedido.cartelasVendidas, // Preservar vendidas
      cartelasDevolvidas,
      status: pedido.status
    });
  }

  static async verificarDisponibilidadeCartelas(bingoId: string, cartelas: number[]): Promise<boolean> {
    try {
      const pedidosExistentes = await this.findByBingo(bingoId);
      
      // Coletar cartelas ocupadas (retiradas e vendidas, mas não devolvidas)
      const cartelasOcupadas = new Set<number>();
      
      for (const pedido of pedidosExistentes) {
        // Cartelas retiradas (pendentes de venda)
        pedido.cartelasRetiradas.forEach(c => cartelasOcupadas.add(c));
        
        // Cartelas vendidas (ocupação permanente)
        pedido.cartelasVendidas.forEach(c => cartelasOcupadas.add(c));
        
        // Cartelas devolvidas voltam ao estoque - não incluir como ocupadas
      }
      
      // Verificar se alguma cartela solicitada já está ocupada
      return !cartelas.some(cartela => cartelasOcupadas.has(cartela));
    } catch {
      return false;
    }
  }

  static async getCartelasPorVendedor(vendedorId: string, bingoId?: string) {
    let pedidosVendedor = await this.findByVendedor(vendedorId);
    
    if (bingoId) {
      pedidosVendedor = pedidosVendedor.filter(p => p.bingoId === bingoId);
    }

    return pedidosVendedor.reduce((acc, pedido) => {
      acc.retiradas += pedido.cartelasRetiradas.length;
      acc.vendidas += pedido.cartelasVendidas.length;
      acc.devolvidas += pedido.cartelasDevolvidas.length;
      acc.pendentes += pedido.cartelasPendentes.length;
      return acc;
    }, {
      retiradas: 0,
      vendidas: 0,
      devolvidas: 0,
      pendentes: 0
    });
  }

  static async delete(id: string): Promise<void> {
    await ApiService.deletePedido(id);
  }
}