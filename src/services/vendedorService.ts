import { db } from '@/db/connection';
import { vendedores, pedidos, type Vendedor, type NewVendedor } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';
import { APP_CONFIG } from '@/config/database';

export class VendedorService {
  static async create(vendedorData: Omit<NewVendedor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vendedor> {
    const [vendedor] = await db.insert(vendedores).values(vendedorData).returning();
    return vendedor;
  }

  static async findById(id: string): Promise<Vendedor | null> {
    const [vendedor] = await db.select().from(vendedores).where(eq(vendedores.id, id));
    return vendedor || null;
  }

  static async findByUser(userId: string): Promise<Vendedor[]> {
    return await db.select().from(vendedores).where(eq(vendedores.userId, userId));
  }

  static async findByEmail(email: string): Promise<Vendedor | null> {
    const [vendedor] = await db.select().from(vendedores).where(eq(vendedores.email, email));
    return vendedor || null;
  }

  static async update(id: string, vendedorData: Partial<Vendedor>): Promise<Vendedor | null> {
    const [vendedor] = await db
      .update(vendedores)
      .set({ ...vendedorData, updatedAt: new Date() })
      .where(eq(vendedores.id, id))
      .returning();
    return vendedor || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(vendedores).where(eq(vendedores.id, id));
    return result.rowCount > 0;
  }

  static async countPedidosAbertos(vendedorId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(pedidos)
      .where(and(
        eq(pedidos.vendedorId, vendedorId),
        eq(pedidos.status, 'aberto')
      ));
    
    return result.count;
  }

  static async canCreateNewPedido(vendedorId: string): Promise<boolean> {
    const pedidosAbertos = await this.countPedidosAbertos(vendedorId);
    return pedidosAbertos < APP_CONFIG.maxPedidosAbertosPorVendedor;
  }

  static async list(): Promise<Vendedor[]> {
    return await db.select().from(vendedores).where(eq(vendedores.ativo, true));
  }
}