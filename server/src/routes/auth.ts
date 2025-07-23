import { Router } from 'express';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário no banco
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!user || user.senha !== senha || !user.ativo) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Remover senha da resposta
    const { senha: _, ...userWithoutPassword } = user;
    
    res.json({ 
      user: userWithoutPassword,
      message: 'Login realizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Verificar usuário atual (para manter sessão)
router.get('/me', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId as string));

    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const { senha: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export const authRoutes = router;