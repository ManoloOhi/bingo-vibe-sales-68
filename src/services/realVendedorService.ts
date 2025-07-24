import { ApiService } from './apiService';

export interface Vendedor {
  id: string;
  userId: string;
  nome: string;
  email: string;
  whatsapp: string;
  ativo: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NewVendedor {
  userId: string;
  nome: string;
  email: string;
  whatsapp: string;
  ativo?: boolean;
}

export class VendedorService {
  static async list(): Promise<Vendedor[]> {
    return ApiService.getVendedores();
  }

  static async findById(id: string): Promise<Vendedor | null> {
    const vendedores = await this.list();
    return vendedores.find(v => v.id === id) || null;
  }

  static async findByUser(userId: string): Promise<Vendedor[]> {
    const vendedores = await this.list();
    return vendedores.filter(v => v.userId === userId);
  }

  static async findByEmail(email: string): Promise<Vendedor | null> {
    const vendedores = await this.list();
    return vendedores.find(v => v.email === email) || null;
  }

  static async create(vendedorData: Omit<NewVendedor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendedor> {
    return ApiService.createVendedor(vendedorData);
  }

  static async update(id: string, vendedorData: Partial<Vendedor>): Promise<Vendedor | null> {
    try {
      return await ApiService.updateVendedor(id, vendedorData);
    } catch (error) {
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await ApiService.deleteVendedor(id);
      return true;
    } catch (error) {
      console.error('Erro ao deletar vendedor:', error);
      throw error;
    }
  }

  static async countPedidosAbertos(vendedorId: string): Promise<number> {
    // Implementar quando tiver endpoint específico
    return 0;
  }

  static async canCreateNewPedido(vendedorId: string): Promise<boolean> {
    const pedidosAbertos = await this.countPedidosAbertos(vendedorId);
    return pedidosAbertos < 5; // APP_CONFIG.maxPedidosAbertosPorVendedor
  }
}