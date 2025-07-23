import { ApiService } from './apiService';

export interface Bingo {
  id: string;
  userId: string;
  nome: string;
  quantidadeCartelas: number;
  rangeInicio: number;
  rangeFim: number;
  valorCartela: string;
  dataBingo: Date | string;
  ativo: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NewBingo {
  userId: string;
  nome: string;
  quantidadeCartelas: number;
  rangeInicio: number;
  rangeFim: number;
  valorCartela: string;
  dataBingo: Date | string;
  ativo?: boolean;
}

export class BingoService {
  static async list(): Promise<Bingo[]> {
    return ApiService.getBingos();
  }

  static async findById(id: string): Promise<Bingo | null> {
    try {
      return await ApiService.getBingo(id);
    } catch (error) {
      return null;
    }
  }

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

    return ApiService.createBingo(bingoData);
  }

  static async update(id: string, bingoData: Partial<Bingo>): Promise<Bingo | null> {
    try {
      return await ApiService.updateBingo(id, bingoData);
    } catch (error) {
      return null;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      await ApiService.deleteBingo(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getCartelasDisponiveis(bingoId: string): Promise<number[]> {
    const bingo = await this.findById(bingoId);
    if (!bingo) throw new Error('Bingo não encontrado');

    // Para implementar completamente, precisaria de endpoints específicos na API
    // Por enquanto, retornar todas as cartelas
    const todasCartelas = Array.from(
      { length: bingo.quantidadeCartelas }, 
      (_, i) => bingo.rangeInicio + i
    );
    
    return todasCartelas;
  }

  static async getCartelasRetiradas(bingoId: string): Promise<number[]> {
    // Implementar quando tiver o endpoint específico
    return [];
  }

  static async getCartelasVendidas(bingoId: string): Promise<number[]> {
    // Implementar quando tiver o endpoint específico
    return [];
  }

  static async getRelatorioCartelas(bingoId: string) {
    const bingo = await this.findById(bingoId);
    if (!bingo) throw new Error('Bingo não encontrado');

    // Implementação básica - expandir quando API estiver completa
    return {
      total: bingo.quantidadeCartelas,
      disponiveis: bingo.quantidadeCartelas,
      retiradas: 0,
      vendidas: 0,
      devolvidas: 0,
      cartelasDisponiveis: Array.from({ length: bingo.quantidadeCartelas }, (_, i) => bingo.rangeInicio + i),
      cartelasRetiradas: [],
      cartelasVendidas: [],
      cartelasDevolvidas: []
    };
  }
}