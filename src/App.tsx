import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthWrapper } from "@/components/AuthWrapper";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Bingos from "./pages/Bingos";
import Vendedores from "./pages/Vendedores";
import Pedidos from "./pages/Pedidos";
import Relatorios from "./pages/Relatorios";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Dados sempre considerados desatualizados
      gcTime: 1000 * 60 * 30, // 30 minutos em cache
      refetchOnWindowFocus: true, // Refetch quando focus na janela
      refetchOnReconnect: true, // Refetch quando reconecta
    },
    mutations: {
      onSuccess: () => {
        // Invalidar todos os dados após qualquer mutação
        queryClient.invalidateQueries();
        // Salvar estado atual no sessionStorage para debug
        const cacheState = {
          timestamp: Date.now(),
          queries: queryClient.getQueryCache().getAll().length
        };
        sessionStorage.setItem('BINGO_CACHE_INFO', JSON.stringify(cacheState));
      },
    },
  },
});

// Configurar persister com sessionStorage  
const sessionStoragePersister = createSyncStoragePersister({
  storage: window.sessionStorage,
  key: 'BINGO_CACHE_KEY',
});

// Restaurar cache do sessionStorage na inicialização
const restoreCache = async () => {
  try {
    await sessionStoragePersister.restoreClient();
    console.log('📦 Cache restaurado do sessionStorage');
  } catch (error) {
    console.log('⚠️ Não foi possível restaurar cache:', error);
  }
};

// Executar restauração
restoreCache();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthWrapper>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/bingos" element={
              <ProtectedRoute adminOnly>
                <Bingos />
              </ProtectedRoute>
            } />
            <Route path="/vendedores" element={
              <ProtectedRoute adminOnly>
                <Vendedores />
              </ProtectedRoute>
            } />
            <Route path="/pedidos" element={
              <ProtectedRoute>
                <Pedidos />
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <Relatorios />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthWrapper>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
