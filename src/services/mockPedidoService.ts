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
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private static savePedidos(pedidos: Pedido[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
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
    pedido.cartelasDevolvidas = [...new Set([...pedido.cartelasDevolvidas, ...cartelas])];
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
}