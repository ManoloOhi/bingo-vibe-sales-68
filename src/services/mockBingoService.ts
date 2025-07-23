import { createId } from '@paralleldrive/cuid2';

export interface Bingo {
  id: string;
  userId: string;
  nome: string;
  quantidadeCartelas: number;
  rangeInicio: number;
  rangeFim: number;
  valorCartela: string;
  dataBingo: Date;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewBingo {
  userId: string;
  nome: string;
  quantidadeCartelas: number;
  rangeInicio: number;
  rangeFim: number;
  valorCartela: string;
  dataBingo: Date;
  ativo?: boolean;
}

const STORAGE_KEY = 'bingos';

export class BingoService {
  private static getBingos(): Bingo[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private static saveBingos(bingos: Bingo[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bingos));
  }

  static async create(bingoData: Omit<NewBingo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bingo> {
    if (bingoData.rangeInicio >= bingoData.rangeFim) {
      throw new Error('Range inválido: início deve ser menor que fim');
    }

    const quantidadeCalculada = bingoData.rangeFim - bingoData.rangeInicio + 1;
    if (bingoData.quantidadeCartelas !== quantidadeCalculada) {
      throw new Error(`Quantidade de cartelas (${bingoData.quantidadeCartelas}) não confere com o range (${quantidadeCalculada})`);
    }

    const bingo: Bingo = {
      ...bingoData,
      id: createId(),
      ativo: bingoData.ativo ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const bingos = this.getBingos();
    bingos.push(bingo);
    this.saveBingos(bingos);

    return bingo;
  }

  static async findById(id: string): Promise<Bingo | null> {
    const bingos = this.getBingos();
    return bingos.find(b => b.id === id) || null;
  }

  static async findByUser(userId: string): Promise<Bingo[]> {
    const bingos = this.getBingos();
    return bingos.filter(b => b.userId === userId);
  }

  static async update(id: string, bingoData: Partial<Bingo>): Promise<Bingo | null> {
    const bingos = this.getBingos();
    const index = bingos.findIndex(b => b.id === id);
    
    if (index === -1) return null;

    bingos[index] = { ...bingos[index], ...bingoData, updatedAt: new Date() };
    this.saveBingos(bingos);
    
    return bingos[index];
  }

  static async delete(id: string): Promise<boolean> {
    const bingos = this.getBingos();
    const index = bingos.findIndex(b => b.id === id);
    
    if (index === -1) return false;

    bingos.splice(index, 1);
    this.saveBingos(bingos);
    
    return true;
  }

  static async list(): Promise<Bingo[]> {
    const bingos = this.getBingos();
    return bingos.filter(b => b.ativo);
  }

  static async getCartelasDisponiveis(bingoId: string): Promise<number[]> {
    const bingo = await this.findById(bingoId);
    if (!bingo) throw new Error('Bingo não encontrado');

    const todasCartelas = Array.from(
      { length: bingo.quantidadeCartelas }, 
      (_, i) => bingo.rangeInicio + i
    );

    return todasCartelas;
  }
}