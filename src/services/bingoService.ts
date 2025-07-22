import { db } from '@/db/connection';
import { bingos, type Bingo, type NewBingo } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export class BingoService {
  static async create(bingoData: Omit<NewBingo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bingo> {
    // Validar se o range está correto
    if (bingoData.rangeInicio >= bingoData.rangeFim) {
      throw new Error('Range inválido: início deve ser menor que fim');
    }

    // Calcular quantidade de cartelas baseado no range
    const quantidadeCalculada = bingoData.rangeFim - bingoData.rangeInicio + 1;
    if (bingoData.quantidadeCartelas !== quantidadeCalculada) {
      throw new Error(`Quantidade de cartelas (${bingoData.quantidadeCartelas}) não confere com o range (${quantidadeCalculada})`);
    }

    const [bingo] = await db.insert(bingos).values(bingoData).returning();
    return bingo;
  }

  static async findById(id: string): Promise<Bingo | null> {
    const [bingo] = await db.select().from(bingos).where(eq(bingos.id, id));
    return bingo || null;
  }

  static async findByUser(userId: string): Promise<Bingo[]> {
    return await db.select().from(bingos).where(eq(bingos.userId, userId));
  }

  static async update(id: string, bingoData: Partial<Bingo>): Promise<Bingo | null> {
    const [bingo] = await db
      .update(bingos)
      .set({ ...bingoData, updatedAt: new Date() })
      .where(eq(bingos.id, id))
      .returning();
    return bingo || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(bingos).where(eq(bingos.id, id));
    return result.rowCount > 0;
  }

  static async list(): Promise<Bingo[]> {
    return await db.select().from(bingos).where(eq(bingos.ativo, true));
  }

  static async getCartelasDisponiveis(bingoId: string): Promise<number[]> {
    const bingo = await this.findById(bingoId);
    if (!bingo) throw new Error('Bingo não encontrado');

    // TODO: Implementar lógica para calcular cartelas disponíveis
    // baseado nas cartelas retiradas e vendidas dos pedidos
    const todasCartelas = Array.from(
      { length: bingo.quantidadeCartelas }, 
      (_, i) => bingo.rangeInicio + i
    );

    return todasCartelas;
  }
}