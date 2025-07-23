import express from 'express';
import cors from 'cors';
import { testConnection } from './db/connection.js';
import { bingoRoutes } from './routes/bingo.js';
import { vendedorRoutes } from './routes/vendedor.js';
import { pedidoRoutes } from './routes/pedido.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/bingos', bingoRoutes);
app.use('/api/vendedores', vendedorRoutes);  
app.use('/api/pedidos', pedidoRoutes);

// Inicializar servidor
async function startServer() {
  try {
    // Testar conexão com banco
    await testConnection();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 API rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();