import { Router } from 'express';
import { db } from '../db/connection.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bingo-secret-key';

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

    // Criar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        tipo: user.tipo 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remover senha da resposta
    const { senha: _, ...userWithoutPassword } = user;
    
    res.json({ 
      token,
      user: userWithoutPassword,
      message: 'Login realizado com sucesso',
      expiresIn: '24h'
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
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));

    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const { senha: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    console.error('Erro ao verificar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export const authRoutes = router;