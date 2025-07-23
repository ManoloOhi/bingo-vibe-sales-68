import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <AuthWrapper>
              <Login />
            </AuthWrapper>
          } />
          <Route path="/" element={
            <AuthWrapper>
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            </AuthWrapper>
          } />
          <Route path="/bingos" element={
            <AuthWrapper>
              <ProtectedRoute adminOnly>
                <Bingos />
              </ProtectedRoute>
            </AuthWrapper>
          } />
          <Route path="/vendedores" element={
            <AuthWrapper>
              <ProtectedRoute adminOnly>
                <Vendedores />
              </ProtectedRoute>
            </AuthWrapper>
          } />
          <Route path="/pedidos" element={
            <AuthWrapper>
              <ProtectedRoute>
                <Pedidos />
              </ProtectedRoute>
            </AuthWrapper>
          } />
          <Route path="/relatorios" element={
            <AuthWrapper>
              <ProtectedRoute>
                <Relatorios />
              </ProtectedRoute>
            </AuthWrapper>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
