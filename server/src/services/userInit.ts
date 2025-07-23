import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const DEFAULT_ADMIN_EMAIL = 'admin@bingo.com';
const DEFAULT_USER_EMAIL = 'user@bingo.com';

export async function initializeUsers() {
  try {
    // Verificar se já existe usuário admin
    const [existingAdmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, DEFAULT_ADMIN_EMAIL));

    if (!existingAdmin) {
      console.log('🔧 Criando usuário administrador padrão...');
      await db.insert(users).values({
        nome: 'Administrador',
        email: DEFAULT_ADMIN_EMAIL,
        whatsapp: '(11) 99999-0000',
        senha: 'admin123', // Em produção, usar hash
        tipo: 'admin'
      });
      console.log('✅ Usuário admin criado:', DEFAULT_ADMIN_EMAIL);
    }

    // Verificar se já existe usuário comum
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, DEFAULT_USER_EMAIL));

    if (!existingUser) {
      console.log('🔧 Criando usuário comum padrão...');
      await db.insert(users).values({
        nome: 'Usuário Teste',
        email: DEFAULT_USER_EMAIL,
        whatsapp: '(11) 88888-0000',
        senha: 'user123', // Em produção, usar hash
        tipo: 'user'
      });
      console.log('✅ Usuário comum criado:', DEFAULT_USER_EMAIL);
    }

    console.log('📋 Credenciais de acesso:');
    console.log('Admin: admin@bingo.com / admin123');
    console.log('User:  user@bingo.com / user123');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar usuários:', error);
    throw error;
  }
}