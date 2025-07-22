import { db } from '@/db/connection';
import { pedidos, cartelasLog, type Pedido, type NewPedido, type NewCartelaLog } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { APP_CONFIG } from '@/config/database';
import { VendedorService } from './vendedorService';
import { BingoService } from './bingoService';

export class PedidoService {
  static async create(pedidoData: Omit<NewPedido, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pedido> {
    // Validações
    if (pedidoData.quantidade > APP_CONFIG.maxCartelasPorPedido) {
      throw new Error(`Máximo de ${APP_CONFIG.maxCartelasPorPedido} cartelas por pedido`);
    }

    // Verificar se vendedor pode criar novo pedido
    const canCreate = await VendedorService.canCreateNewPedido(pedidoData.vendedorId);
    if (!canCreate) {
      throw new Error(`Vendedor já possui ${APP_CONFIG.maxPedidosAbertosPorVendedor} pedidos abertos`);
    }

    const [pedido] = await db.insert(pedidos).values(pedidoData).returning();
    return pedido;
  }

  static async findById(id: string): Promise<Pedido | null> {
    const [pedido] = await db.select().from(pedidos).where(eq(pedidos.id, id));
    return pedido || null;
  }

  static async findByVendedor(vendedorId: string): Promise<Pedido[]> {
    return await db.select().from(pedidos).where(eq(pedidos.vendedorId, vendedorId));
  }

  static async findByBingo(bingoId: string): Promise<Pedido[]> {
    return await db.select().from(pedidos).where(eq(pedidos.bingoId, bingoId));
  }

  static async retirarCartelas(pedidoId: string, cartelas: number[]): Promise<Pedido | null> {
    const pedido = await this.findById(pedidoId);
    if (!pedido) throw new Error('Pedido não encontrado');

    // Verificar duplicidade de cartelas no sistema
    await this.verificarDuplicidadeCartelas(pedido.bingoId, cartelas);

    // Atualizar pedido
    const cartelasRetiradas = [...pedido.cartelasRetiradas, ...cartelas];
    const cartelasPendentes = [...pedido.cartelasPendentes, ...cartelas];

    const [pedidoAtualizado] = await db
      .update(pedidos)
      .set({ 
        cartelasRetiradas,
        cartelasPendentes,
        updatedAt: new Date() 
      })
      .where(eq(pedidos.id, pedidoId))
      .returning();

    // Registrar log
    await this.registrarLogCartelas(pedido.bingoId, pedidoId, cartelas, 'retirada');

    return pedidoAtualizado;
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

    const [pedidoAtualizado] = await db
      .update(pedidos)
      .set({ 
        cartelasPendentes,
        cartelasVendidas,
        updatedAt: new Date() 
      })
      .where(eq(pedidos.id, pedidoId))
      .returning();

    // Registrar log
    await this.registrarLogCartelas(pedido.bingoId, pedidoId, cartelas, 'venda');

    return pedidoAtualizado;
  }

  static async devolverCartelas(pedidoId: string, cartelas: number[]): Promise<Pedido | null> {
    const pedido = await this.findById(pedidoId);
    if (!pedido) throw new Error('Pedido não encontrado');

    // Verificar se todas as cartelas estão vendidas
    const cartelasInvalidas = cartelas.filter(c => !pedido.cartelasVendidas.includes(c));
    if (cartelasInvalidas.length > 0) {
      throw new Error(`Cartelas não podem ser devolvidas: ${cartelasInvalidas.join(', ')}`);
    }

    // Mover cartelas de vendidas para devolvidas
    const cartelasVendidas = pedido.cartelasVendidas.filter(c => !cartelas.includes(c));
    const cartelasDevolvidas = [...pedido.cartelasDevolvidas, ...cartelas];

    const [pedidoAtualizado] = await db
      .update(pedidos)
      .set({ 
        cartelasVendidas,
        cartelasDevolvidas,
        updatedAt: new Date() 
      })
      .where(eq(pedidos.id, pedidoId))
      .returning();

    // Registrar log
    await this.registrarLogCartelas(pedido.bingoId, pedidoId, cartelas, 'devolucao');

    return pedidoAtualizado;
  }

  private static async verificarDuplicidadeCartelas(bingoId: string, novasCartelas: number[]): Promise<void> {
    const pedidosExistentes = await this.findByBingo(bingoId);
    const cartelasJaRetiradas = pedidosExistentes.flatMap(p => p.cartelasRetiradas);
    
    const duplicadas = novasCartelas.filter(c => cartelasJaRetiradas.includes(c));
    if (duplicadas.length > 0) {
      throw new Error(`Cartelas já retiradas: ${duplicadas.join(', ')}`);
    }
  }

  private static async registrarLogCartelas(
    bingoId: string, 
    pedidoId: string, 
    cartelas: number[], 
    acao: 'retirada' | 'venda' | 'devolucao'
  ): Promise<void> {
    const logs: NewCartelaLog[] = cartelas.map(cartela => ({
      bingoId,
      pedidoId,
      cartela,
      acao,
    }));

    await db.insert(cartelasLog).values(logs);
  }

  static async update(id: string, pedidoData: Partial<Pedido>): Promise<Pedido | null> {
    const [pedido] = await db
      .update(pedidos)
      .set({ ...pedidoData, updatedAt: new Date() })
      .where(eq(pedidos.id, id))
      .returning();
    return pedido || null;
  }

  static async list(): Promise<Pedido[]> {
    return await db.select().from(pedidos);
  }
}