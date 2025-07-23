import { BingoService } from './mockBingoService';
import { VendedorService } from './mockVendedorService';
import { PedidoService } from './mockPedidoService';
import { getDefaultUserId } from './userInit';

export async function initializeMockData() {
  try {
    console.log('Verificando se precisa inicializar dados...');
    
    // Verificar se já existem dados
    const existingBingos = await BingoService.list();
    const existingVendedores = await VendedorService.list();
    
    console.log('Bingos existentes:', existingBingos.length);
    console.log('Vendedores existentes:', existingVendedores.length);
    
    if (existingBingos.length > 0 || existingVendedores.length > 0) {
      console.log('Dados já existem, não inicializando');
      return;
    }

    console.log('Criando dados iniciais...');

    const userId = await getDefaultUserId();

    // Criar bingo de exemplo
    const bingo = await BingoService.create({
      userId,
      nome: 'Bingo de São João 2024',
      quantidadeCartelas: 100,
      rangeInicio: 1,
      rangeFim: 100,
      valorCartela: '5.00',
      dataBingo: new Date('2024-06-24'),
      ativo: true
    });

    // Criar vendedores de exemplo
    const vendedor1 = await VendedorService.create({
      userId,
      nome: 'João Silva',
      email: 'joao@exemplo.com',
      whatsapp: '(11) 99999-1111',
      ativo: true
    });

    const vendedor2 = await VendedorService.create({
      userId,
      nome: 'Maria Santos',
      email: 'maria@exemplo.com',
      whatsapp: '(11) 99999-2222',
      ativo: true
    });

    // Criar pedidos de exemplo
    await PedidoService.create({
      bingoId: bingo.id,
      vendedorId: vendedor1.id,
      quantidade: 50,
      status: 'aberto'
    });

    await PedidoService.create({
      bingoId: bingo.id,
      vendedorId: vendedor2.id,
      quantidade: 30,
      status: 'aberto'
    });

    console.log('Dados de exemplo criados com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar dados:', error);
  }
}