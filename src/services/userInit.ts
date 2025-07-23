import { UserService } from './userService';

const DEFAULT_USER_EMAIL = 'admin@bingo.com';

export async function getOrCreateDefaultUser() {
  try {
    // Tentar encontrar usuário existente
    let user = await UserService.findByEmail(DEFAULT_USER_EMAIL);
    
    if (!user) {
      console.log('Criando usuário padrão...');
      // Criar usuário padrão se não existir
      user = await UserService.create({
        nome: 'Administrador',
        email: DEFAULT_USER_EMAIL,
        whatsapp: '(11) 99999-0000',
        senha: 'admin123', // Em produção, usar hash apropriado
        tipo: 'admin'
      });
      console.log('Usuário padrão criado:', user.id);
    }
    
    return user;
  } catch (error) {
    console.error('Erro ao criar/obter usuário padrão:', error);
    throw error;
  }
}

export async function getDefaultUserId(): Promise<string> {
  // Por enquanto, usar um ID fixo. Em produção, seria obtido da autenticação via API
  return 'default-admin-user';
}