import { createId } from '@paralleldrive/cuid2';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface NewPedido {
  bingoId: string;
  vendedorId: string;
  quantidade: number;
  status?: 'aberto' | 'fechado' | 'cancelado';
}

const STORAGE_KEY = 'pedidos';

export class PedidoService {
  private static getPedidos(): Pedido[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const result = stored ? JSON.parse(stored) : [];
      console.log('PedidoService.getPedidos:', result.length, 'pedidos encontrados');
      return result;
    } catch (error) {
      console.error('Erro ao acessar localStorage para pedidos:', error);
      return [];
    }
  }

  private static savePedidos(pedidos: Pedido[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
      console.log('PedidoService.savePedidos: salvos', pedidos.length, 'pedidos');
    } catch (error) {
      console.error('Erro ao salvar pedidos no localStorage:', error);
    }
  }

  static async create(pedidoData: Omit<NewPedido, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pedido> {
    const pedido: Pedido = {
      ...pedidoData,
      id: createId(),
      cartelasRetiradas: [],
      cartelasPendentes: [],
      cartelasVendidas: [],
      cartelasDevolvidas: [],
      status: pedidoData.status || 'aberto',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const pedidos = this.getPedidos();
    pedidos.push(pedido);
    this.savePedidos(pedidos);

    return pedido;
  }

  static async findById(id: string): Promise<Pedido | null> {
    const pedidos = this.getPedidos();
    return pedidos.find(p => p.id === id) || null;
  }

  static async findByVendedor(vendedorId: string): Promise<Pedido[]> {
    const pedidos = this.getPedidos();
    return pedidos.filter(p => p.vendedorId === vendedorId);
  }

  static async findByBingo(bingoId: string): Promise<Pedido[]> {
    const pedidos = this.getPedidos();
    return pedidos.filter(p => p.bingoId === bingoId);
  }

  static async retirarCartelas(pedidoId: string, cartelas: number[]): Promise<Pedido | null> {
    const pedidos = this.getPedidos();
    const index = pedidos.findIndex(p => p.id === pedidoId);
    
    if (index === -1) return null;

    const pedido = pedidos[index];
    
    // Verificar se as cartelas já foram retiradas por outro pedido
    await this.verificarDisponibilidadeCartelas(pedido.bingoId, cartelas, pedidoId);
    
    pedido.cartelasRetiradas = [...new Set([...pedido.cartelasRetiradas, ...cartelas])];
    pedido.updatedAt = new Date();
    
    this.savePedidos(pedidos);
    return pedido;
  }

  static async venderCartelas(pedidoId: string, cartelas: number[]): Promise<Pedido | null> {
    const pedidos = this.getPedidos();
    const index = pedidos.findIndex(p => p.id === pedidoId);
    
    if (index === -1) return null;

    const pedido = pedidos[index];
    
    // Verificar se as cartelas foram retiradas primeiro
    const cartelasNaoRetiradas = cartelas.filter(c => !pedido.cartelasRetiradas.includes(c));
    if (cartelasNaoRetiradas.length > 0) {
      throw new Error(`Cartelas ${cartelasNaoRetiradas.join(', ')} não foram retiradas ainda`);
    }
    
    pedido.cartelasVendidas = [...new Set([...pedido.cartelasVendidas, ...cartelas])];
    pedido.updatedAt = new Date();
    
    this.savePedidos(pedidos);
    return pedido;
  }

  static async devolverCartelas(pedidoId: string, cartelas: number[]): Promise<Pedido | null> {
    const pedidos = this.getPedidos();
    const index = pedidos.findIndex(p => p.id === pedidoId);
    
    if (index === -1) return null;

    const pedido = pedidos[index];
    
    // Verificar se as cartelas foram retiradas primeiro
    const cartelasNaoRetiradas = cartelas.filter(c => !pedido.cartelasRetiradas.includes(c));
    if (cartelasNaoRetiradas.length > 0) {
      throw new Error(`Cartelas ${cartelasNaoRetiradas.join(', ')} não foram retiradas ainda`);
    }
    
    pedido.cartelasDevolvidas = [...new Set([...pedido.cartelasDevolvidas, ...cartelas])];
    // Remover das cartelas retiradas quando devolvidas
    pedido.cartelasRetiradas = pedido.cartelasRetiradas.filter(c => !cartelas.includes(c));
    pedido.updatedAt = new Date();
    
    this.savePedidos(pedidos);
    return pedido;
  }

  static async update(id: string, pedidoData: Partial<Pedido>): Promise<Pedido | null> {
    const pedidos = this.getPedidos();
    const index = pedidos.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    pedidos[index] = { ...pedidos[index], ...pedidoData, updatedAt: new Date() };
    this.savePedidos(pedidos);
    
    return pedidos[index];
  }

  static async list(): Promise<Pedido[]> {
    return this.getPedidos();
  }

  private static async verificarDisponibilidadeCartelas(bingoId: string, cartelas: number[], pedidoIdExcluir?: string): Promise<void> {
    const pedidos = this.getPedidos().filter(p => p.bingoId === bingoId && p.id !== pedidoIdExcluir);
    
    const cartelasJaRetiradas = new Set<number>();
    pedidos.forEach(pedido => {
      pedido.cartelasRetiradas.forEach(cartela => cartelasJaRetiradas.add(cartela));
    });

    const cartelasIndisponiveis = cartelas.filter(c => cartelasJaRetiradas.has(c));
    if (cartelasIndisponiveis.length > 0) {
      throw new Error(`Cartelas ${cartelasIndisponiveis.join(', ')} já foram retiradas por outro vendedor`);
    }
  }

  static async getCartelasPorVendedor(vendedorId: string, bingoId?: string) {
    const pedidos = this.getPedidos().filter(p => 
      p.vendedorId === vendedorId && (!bingoId || p.bingoId === bingoId)
    );
    
    const resultado = {
      retiradas: [] as number[],
      vendidas: [] as number[],
      devolvidas: [] as number[],
      pendentes: [] as number[]
    };

    pedidos.forEach(pedido => {
      resultado.retiradas.push(...pedido.cartelasRetiradas);
      resultado.vendidas.push(...pedido.cartelasVendidas);
      resultado.devolvidas.push(...pedido.cartelasDevolvidas);
      
      // Cartelas pendentes = retiradas - vendidas - devolvidas
      const pendentes = pedido.cartelasRetiradas.filter(c => 
        !pedido.cartelasVendidas.includes(c) && !pedido.cartelasDevolvidas.includes(c)
      );
      resultado.pendentes.push(...pendentes);
    });

    // Remover duplicatas e ordenar
    resultado.retiradas = [...new Set(resultado.retiradas)].sort((a, b) => a - b);
    resultado.vendidas = [...new Set(resultado.vendidas)].sort((a, b) => a - b);
    resultado.devolvidas = [...new Set(resultado.devolvidas)].sort((a, b) => a - b);
    resultado.pendentes = [...new Set(resultado.pendentes)].sort((a, b) => a - b);

    return resultado;
  }
}