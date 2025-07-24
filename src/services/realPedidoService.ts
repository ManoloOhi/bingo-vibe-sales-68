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
    const cartelasDevolvidas = new Set<number>();
    
    todosPedidosDoBingo.forEach(p => {
      p.cartelasRetiradas.forEach(cartela => cartelasOcupadas.add(cartela));
      p.cartelasDevolvidas.forEach(cartela => cartelasDevolvidas.add(cartela));
    });
    
    // Verificar se alguma cartela está ocupada e não foi devolvida
    const cartelasIndisponiveis = cartelas.filter(cartela => {
      const estaOcupada = cartelasOcupadas.has(cartela);  
      const foiDevolvida = cartelasDevolvidas.has(cartela);
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

    // Atualizar pedido apenas com cartelas válidas
    const cartelasRetiradas = [...pedido.cartelasRetiradas, ...cartelas];
    const cartelasPendentes = [...pedido.cartelasPendentes, ...cartelas];

    return this.update(pedidoId, {
      cartelasRetiradas,
      cartelasPendentes
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

    // Mover cartelas de pendentes para vendidas
    const cartelasPendentes = pedido.cartelasPendentes.filter(c => !cartelas.includes(c));
    const cartelasVendidas = [...pedido.cartelasVendidas, ...cartelas];

    return this.update(pedidoId, {
      cartelasPendentes,
      cartelasVendidas
    });
  }

  static async devolverCartelas(pedidoId: string, cartelas: number[]): Promise<Pedido | null> {
    const pedido = await this.findById(pedidoId);
    if (!pedido) throw new Error('Pedido não encontrado');

    // Verificar se todas as cartelas estão vendidas
    const cartelasInvalidas = cartelas.filter(c => !pedido.cartelasVendidas.includes(c));
    if (cartelasInvalidas.length > 0) {
      throw new Error(`Cartelas não podem ser devolvidas: ${cartelasInvalidas.join(', ')}`);
    }

    // Mover cartelas de vendidas para devolvidas e adicionar de volta às pendentes
    const cartelasVendidas = pedido.cartelasVendidas.filter(c => !cartelas.includes(c));
    const cartelasDevolvidas = [...pedido.cartelasDevolvidas, ...cartelas];
    const cartelasPendentes = [...pedido.cartelasPendentes, ...cartelas];

    return this.update(pedidoId, {
      cartelasVendidas,
      cartelasDevolvidas,
      cartelasPendentes
    });
  }

  static async verificarDisponibilidadeCartelas(bingoId: string, cartelas: number[]): Promise<boolean> {
    try {
      const pedidosExistentes = await this.findByBingo(bingoId);
      const cartelasJaRetiradas = pedidosExistentes.flatMap(p => p.cartelasRetiradas);
      
      const duplicadas = cartelas.filter(c => cartelasJaRetiradas.includes(c));
      return duplicadas.length === 0;
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
}