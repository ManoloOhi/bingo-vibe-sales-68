import { createId } from '@paralleldrive/cuid2';

export interface Vendedor {
  id: string;
  userId: string;
  nome: string;
  email: string;
  whatsapp: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewVendedor {
  userId: string;
  nome: string;
  email: string;
  whatsapp: string;
  ativo?: boolean;
}

const STORAGE_KEY = 'vendedores';

export class VendedorService {
  private static getVendedores(): Vendedor[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const result = stored ? JSON.parse(stored) : [];
      console.log('VendedorService.getVendedores:', result.length, 'vendedores encontrados');
      return result;
    } catch (error) {
      console.error('Erro ao acessar localStorage para vendedores:', error);
      return [];
    }
  }

  private static saveVendedores(vendedores: Vendedor[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vendedores));
      console.log('VendedorService.saveVendedores: salvos', vendedores.length, 'vendedores');
    } catch (error) {
      console.error('Erro ao salvar vendedores no localStorage:', error);
    }
  }

  static async create(vendedorData: Omit<NewVendedor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendedor> {
    const vendedor: Vendedor = {
      ...vendedorData,
      id: createId(),
      ativo: vendedorData.ativo ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const vendedores = this.getVendedores();
    vendedores.push(vendedor);
    this.saveVendedores(vendedores);

    return vendedor;
  }

  static async findById(id: string): Promise<Vendedor | null> {
    const vendedores = this.getVendedores();
    return vendedores.find(v => v.id === id) || null;
  }

  static async findByUser(userId: string): Promise<Vendedor[]> {
    const vendedores = this.getVendedores();
    return vendedores.filter(v => v.userId === userId);
  }

  static async findByEmail(email: string): Promise<Vendedor | null> {
    const vendedores = this.getVendedores();
    return vendedores.find(v => v.email === email) || null;
  }

  static async update(id: string, vendedorData: Partial<Vendedor>): Promise<Vendedor | null> {
    const vendedores = this.getVendedores();
    const index = vendedores.findIndex(v => v.id === id);
    
    if (index === -1) return null;

    vendedores[index] = { ...vendedores[index], ...vendedorData, updatedAt: new Date() };
    this.saveVendedores(vendedores);
    
    return vendedores[index];
  }

  static async delete(id: string): Promise<boolean> {
    const vendedores = this.getVendedores();
    const index = vendedores.findIndex(v => v.id === id);
    
    if (index === -1) return false;

    vendedores.splice(index, 1);
    this.saveVendedores(vendedores);
    
    return true;
  }

  static async countPedidosAbertos(vendedorId: string): Promise<number> {
    // Mock implementation - in real app this would query pedidos table
    return 0;
  }

  static async canCreateNewPedido(vendedorId: string): Promise<boolean> {
    const pedidosAbertos = await this.countPedidosAbertos(vendedorId);
    return pedidosAbertos < 5; // APP_CONFIG.maxPedidosAbertosPorVendedor
  }

  static async list(): Promise<Vendedor[]> {
    const vendedores = this.getVendedores();
    return vendedores.filter(v => v.ativo);
  }
}