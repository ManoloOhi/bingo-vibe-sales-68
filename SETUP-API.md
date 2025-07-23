# 🎯 BINGO VIBE SALES - API INTEGRADA

Sistema completo de gerenciamento de bingos integrado com API REST + PostgreSQL.

## 🚀 COMO EXECUTAR

### 1️⃣ Executar a API (Backend)
```bash
# Em um terminal separado
cd server
npm install
npm run dev
```
A API rodará em: `http://localhost:3001`

### 2️⃣ Executar o Frontend
```bash
# No terminal principal
npm run dev
```
O frontend rodará em: `http://localhost:8080`

## ✅ VERIFICAR SE ESTÁ FUNCIONANDO

1. **API Status**: Verifique se aparece "✅ API Conectada" no header da aplicação
2. **Health Check**: Acesse `http://localhost:3001/health`
3. **Dados Reais**: Crie um bingo e verifique se salva no banco PostgreSQL

## 📡 ENDPOINTS DA API

### Bingos
- `GET /api/bingos` - Listar bingos
- `POST /api/bingos` - Criar bingo
- `PUT /api/bingos/:id` - Atualizar bingo
- `DELETE /api/bingos/:id` - Deletar bingo

### Vendedores
- `GET /api/vendedores` - Listar vendedores
- `POST /api/vendedores` - Criar vendedor
- `PUT /api/vendedores/:id` - Atualizar vendedor

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Criar pedido
- `PUT /api/pedidos/:id` - Atualizar pedido

## 🗄️ BANCO DE DADOS

**PostgreSQL configurado:**
- **Host:** vps.iaautomation-dev.com.br
- **Database:** bingo
- **Port:** 5432
- **Tabelas:** users, bingos, vendedores, pedidos

## 📁 ESTRUTURA DO PROJETO

```
📦 Frontend (React + Vite)
├── src/
│   ├── services/
│   │   ├── apiService.ts          # Client da API REST
│   │   ├── realBingoService.ts    # Service de Bingos
│   │   ├── realVendedorService.ts # Service de Vendedores
│   │   └── realPedidoService.ts   # Service de Pedidos
│   ├── pages/
│   │   ├── Index.tsx              # Dashboard
│   │   ├── Bingos.tsx             # Gestão de Bingos
│   │   ├── Vendedores.tsx         # Gestão de Vendedores
│   │   ├── Pedidos.tsx            # Gestão de Pedidos
│   │   └── Relatorios.tsx         # Relatórios
│   └── components/
│       ├── forms/                 # Formulários CRUD
│       └── ui/
│           └── api-status.tsx     # Status da API

📦 Backend (Node.js + Express)
├── server/
│   ├── src/
│   │   ├── server.ts              # Servidor Express
│   │   ├── db/
│   │   │   ├── connection.ts      # Conexão PostgreSQL
│   │   │   └── schema.ts          # Schema Drizzle
│   │   └── routes/
│   │       ├── bingo.ts           # CRUD Bingos
│   │       ├── vendedor.ts        # CRUD Vendedores
│   │       └── pedido.ts          # CRUD Pedidos
│   └── package.json
```

## 🔧 TECNOLOGIAS UTILIZADAS

### Frontend:
- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS** (Styling)
- **Shadcn/ui** (Components)
- **Lucide React** (Icons)

### Backend:
- **Node.js** + **Express**
- **TypeScript**
- **Drizzle ORM**
- **PostgreSQL**

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Gestão de Bingos
- Criar, editar, listar e deletar bingos
- Controle de cartelas e ranges
- Validações de negócio

### ✅ Gestão de Vendedores
- Cadastro de vendedores
- Controle de status (ativo/inativo)
- Edição de dados

### ✅ Gestão de Pedidos
- Criação de pedidos para vendedores
- Controle de cartelas (retirada, venda, devolução)
- Status dos pedidos

### ✅ Relatórios
- Dashboard com estatísticas
- Relatórios por vendedor
- Controle de performance

### ✅ Sistema Responsivo
- Layout otimizado para mobile
- Navigation bottom
- Header fixo

## 🚨 TROUBLESHOOTING

### API Offline (❌)
1. Verifique se a API está rodando: `cd server && npm run dev`
2. Teste o health check: `curl http://localhost:3001/health`
3. Verifique a conexão com PostgreSQL

### Erro de CORS
Já configurado no backend com `cors()` middleware

### Erro de Conexão com Banco
Verifique as credenciais em `server/src/db/connection.ts`

## ✨ PRÓXIMOS PASSOS

1. **Autenticação**: Implementar login/logout
2. **Relatórios Avançados**: Gráficos e estatísticas
3. **Notificações**: Sistema de alertas
4. **Export**: Relatórios em PDF/Excel
5. **Deploy**: Configurar para produção

---

**🎉 SISTEMA COMPLETAMENTE FUNCIONAL!**
Frontend + Backend + Banco de Dados integrados e funcionando!