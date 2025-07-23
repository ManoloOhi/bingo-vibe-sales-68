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
    // Validar se o range está correto
    if (bingoData.rangeInicio >= bingoData.rangeFim) {
      throw new Error('Range inválido: início deve ser menor que fim');
    }

    // Calcular quantidade de cartelas baseado no range
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

    // Buscar todas as cartelas retiradas em todos os pedidos deste bingo
    const { PedidoService } = await import('./mockPedidoService');
    const pedidos = await PedidoService.findByBingo(bingoId);
    
    const cartelasRetiradas = new Set<number>();
    pedidos.forEach(pedido => {
      pedido.cartelasRetiradas.forEach(cartela => cartelasRetiradas.add(cartela));
    });

    // Gerar todas as cartelas do range
    const todasCartelas = Array.from(
      { length: bingo.quantidadeCartelas }, 
      (_, i) => bingo.rangeInicio + i
    );

    // Filtrar apenas as disponíveis
    return todasCartelas.filter(cartela => !cartelasRetiradas.has(cartela));
  }

  static async getCartelasRetiradas(bingoId: string): Promise<number[]> {
    const { PedidoService } = await import('./mockPedidoService');
    const pedidos = await PedidoService.findByBingo(bingoId);
    
    const cartelasRetiradas = new Set<number>();
    pedidos.forEach(pedido => {
      pedido.cartelasRetiradas.forEach(cartela => cartelasRetiradas.add(cartela));
    });

    return Array.from(cartelasRetiradas).sort((a, b) => a - b);
  }

  static async getCartelasVendidas(bingoId: string): Promise<number[]> {
    const { PedidoService } = await import('./mockPedidoService');
    const pedidos = await PedidoService.findByBingo(bingoId);
    
    const cartelasVendidas = new Set<number>();
    pedidos.forEach(pedido => {
      pedido.cartelasVendidas.forEach(cartela => cartelasVendidas.add(cartela));
    });

    return Array.from(cartelasVendidas).sort((a, b) => a - b);
  }

  static async getRelatorioCartelas(bingoId: string) {
    const bingo = await this.findById(bingoId);
    if (!bingo) throw new Error('Bingo não encontrado');

    const [disponiveis, retiradas, vendidas] = await Promise.all([
      this.getCartelasDisponiveis(bingoId),
      this.getCartelasRetiradas(bingoId),
      this.getCartelasVendidas(bingoId)
    ]);

    const { PedidoService } = await import('./mockPedidoService');
    const pedidos = await PedidoService.findByBingo(bingoId);
    
    const cartelasDevolvidas = new Set<number>();
    pedidos.forEach(pedido => {
      pedido.cartelasDevolvidas.forEach(cartela => cartelasDevolvidas.add(cartela));
    });

    return {
      total: bingo.quantidadeCartelas,
      disponiveis: disponiveis.length,
      retiradas: retiradas.length,
      vendidas: vendidas.length,
      devolvidas: cartelasDevolvidas.size,
      cartelasDisponiveis: disponiveis,
      cartelasRetiradas: retiradas,
      cartelasVendidas: vendidas,
      cartelasDevolvidas: Array.from(cartelasDevolvidas).sort((a, b) => a - b)
    };
  }
}