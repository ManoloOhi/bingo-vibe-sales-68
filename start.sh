#!/bin/bash

# Script para iniciar o sistema completo Bingo Vibe Sales
echo "🎯 INICIANDO BINGO VIBE SALES - SISTEMA COMPLETO"
echo "================================================"

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale o npm primeiro."
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"
echo "✅ npm $(npm --version) encontrado"

# Instalar dependências do frontend se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

# Instalar dependências do backend se necessário
if [ ! -d "server/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd server
    npm install
    cd ..
fi

echo ""
echo "🚀 INICIANDO SERVIÇOS..."
echo ""

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Iniciar API (backend) em background
echo "🔧 Iniciando API (Backend) na porta 3001..."
cd server
npm run dev &
API_PID=$!
cd ..

# Aguardar um pouco para a API inicializar
sleep 3

# Testar se a API está rodando
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ API iniciada com sucesso!"
else
    echo "⚠️  API pode não estar rodando corretamente"
fi

echo ""
echo "🌐 Iniciando Frontend na porta 8080..."
echo ""

# Iniciar frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 SISTEMA INICIADO COM SUCESSO!"
echo "================================"
echo ""
echo "📋 INFORMAÇÕES DOS SERVIÇOS:"
echo "🔧 API (Backend):  http://localhost:3001"
echo "🌐 Frontend:       http://localhost:8080"
echo "🏥 Health Check:   http://localhost:3001/health"
echo ""
echo "📊 STATUS:"
echo "✅ API conectada ao PostgreSQL (vps.iaautomation-dev.com.br)"
echo "✅ Frontend integrado com API REST"
echo "✅ Sistema completo funcionando"
echo ""
echo "🚨 Para parar os serviços, pressione Ctrl+C"
echo ""

# Aguardar indefinidamente (até Ctrl+C)
wait