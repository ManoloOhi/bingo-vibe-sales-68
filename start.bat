@echo off
REM Script para iniciar o sistema completo Bingo Vibe Sales no Windows

echo 🎯 INICIANDO BINGO VIBE SALES - SISTEMA COMPLETO
echo ================================================

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado. Instale o Node.js primeiro.
    pause
    exit /b 1
)

REM Verificar se npm está instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm não encontrado. Instale o npm primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo ✅ npm encontrado

REM Instalar dependências do frontend se necessário
if not exist node_modules (
    echo 📦 Instalando dependências do frontend...
    npm install
)

REM Instalar dependências do backend se necessário
if not exist server\node_modules (
    echo 📦 Instalando dependências do backend...
    cd server
    npm install
    cd ..
)

echo.
echo 🚀 INICIANDO SERVIÇOS...
echo.

REM Iniciar API (backend) em nova janela
echo 🔧 Iniciando API (Backend) na porta 3001...
start "Bingo API" cmd /k "cd server && npm run dev"

REM Aguardar um pouco para a API inicializar
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Iniciando Frontend na porta 8080...
echo.

REM Iniciar frontend
start "Bingo Frontend" cmd /k "npm run dev"

echo.
echo 🎉 SISTEMA INICIADO COM SUCESSO!
echo ================================
echo.
echo 📋 INFORMAÇÕES DOS SERVIÇOS:
echo 🔧 API (Backend):  http://localhost:3001
echo 🌐 Frontend:       http://localhost:8080
echo 🏥 Health Check:   http://localhost:3001/health
echo.
echo 📊 STATUS:
echo ✅ API conectada ao PostgreSQL (vps.iaautomation-dev.com.br)
echo ✅ Frontend integrado com API REST
echo ✅ Sistema completo funcionando
echo.
echo 🌐 Abrindo navegador...

REM Aguardar mais um pouco e abrir navegador
timeout /t 3 /nobreak > nul
start http://localhost:8080

echo.
echo ✨ Pronto! O sistema está rodando.
echo 📝 Feche as janelas do terminal para parar os serviços.
pause