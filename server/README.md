# Bingo API

API REST para o sistema de gerenciamento de bingos usando Drizzle ORM + PostgreSQL.

## Como executar

1. **Instalar dependências:**
```bash
cd server
npm install
```

2. **Executar em desenvolvimento:**
```bash
npm run dev
```

3. **Build para produção:**
```bash
npm run build
npm start
```

## Endpoints da API

### Bingos
- `GET /api/bingos` - Listar todos os bingos
- `GET /api/bingos/:id` - Buscar bingo por ID  
- `POST /api/bingos` - Criar novo bingo
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

## Configuração do Banco

A API conecta automaticamente ao PostgreSQL configurado em:
- Host: vps.iaautomation-dev.com.br
- Database: bingo
- Port: 5432

## Health Check

`GET /health` - Verifica se a API está funcionando

## Estrutura

- `src/server.ts` - Servidor principal
- `src/db/connection.ts` - Conexão com PostgreSQL
- `src/db/schema.ts` - Schema das tabelas
- `src/routes/` - Rotas da API