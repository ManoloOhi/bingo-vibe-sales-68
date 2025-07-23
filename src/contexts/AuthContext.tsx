import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ApiService } from '@/services/apiService';

export interface User {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  tipo: 'admin' | 'user';
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = user?.tipo === 'admin';

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 AUTH: Verificando autenticação...');
      console.log('🔍 AUTH: URL da API:', 'https://api-bingo.iaautomation-dev.com.br/api');
      
      try {
        const token = localStorage.getItem('token');
        const savedUserId = localStorage.getItem('userId');
        const userInfo = localStorage.getItem('userInfo');
        
        console.log('🔍 AUTH: Token encontrado:', !!token);
        console.log('🔍 AUTH: Token value:', token?.substring(0, 20) + '...');
        console.log('🔍 AUTH: UserId encontrado:', !!savedUserId);
        console.log('🔍 AUTH: UserInfo encontrado:', !!userInfo);
        
        if (token && savedUserId) {
          console.log('🔍 AUTH: Chamando getCurrentUser...');
          console.log('🔍 AUTH: Fazendo requisição para /auth/me');
          
          // Primeiro testar se a API está acessível
          try {
            console.log('🔍 AUTH: Testando conectividade com a API...');
            await ApiService.healthCheck();
            console.log('🔍 AUTH: API está acessível');
          } catch (healthError: any) {
            console.error('❌ AUTH: API não está acessível:', healthError);
            console.error('❌ AUTH: Erro de conectividade:', healthError?.message);
            // Se a API não está acessível, não limpar os dados - pode ser problema temporário
            console.log('🔍 AUTH: Mantendo dados do usuário devido a problema de conectividade');
            setIsLoading(false);
            return;
          }
          
          try {
            const response = await ApiService.getCurrentUser();
            console.log('🔍 AUTH: Resposta getCurrentUser bem-sucedida:', response);
            
            if (response.user) {
              setUser(response.user);
              console.log('🔍 AUTH: Usuário definido no contexto:', response.user.email);
            } else {
              console.log('🔍 AUTH: Resposta não contém usuário');
              throw new Error('Resposta da API não contém dados do usuário');
            }
          } catch (apiError: any) {
            console.error('❌ AUTH: Erro na API getCurrentUser:', apiError);
            console.error('❌ AUTH: Tipo do erro:', typeof apiError);
            console.error('❌ AUTH: Mensagem do erro:', apiError?.message);
            console.error('❌ AUTH: Stack do erro:', apiError?.stack);
            
            // Só limpar dados se for erro de autenticação (401/403), não erro de rede
            if (apiError?.message?.includes('401') || apiError?.message?.includes('403') || 
                apiError?.message?.includes('Token') || apiError?.message?.includes('Unauthorized')) {
              console.log('🔍 AUTH: Erro de autenticação - limpando dados do localStorage');
              localStorage.removeItem('token');
              localStorage.removeItem('userId');
              localStorage.removeItem('userInfo');
              setUser(null);
            } else {
              console.log('🔍 AUTH: Erro de rede - mantendo dados do usuário');
              // Tentar usar dados salvos como fallback
              if (userInfo) {
                try {
                  const savedUser = JSON.parse(userInfo);
                  setUser(savedUser);
                  console.log('🔍 AUTH: Usando dados salvos como fallback:', savedUser.email);
                } catch (parseError) {
                  console.error('❌ AUTH: Erro ao fazer parse dos dados salvos:', parseError);
                  setUser(null);
                }
              }
            }
          }
        } else {
          console.log('🔍 AUTH: Token ou UserId não encontrados, definindo user como null');
          setUser(null);
        }
      } catch (error: any) {
        console.error('❌ AUTH: Erro geral na verificação:', error);
        console.error('❌ AUTH: Tipo do erro geral:', typeof error);
        console.error('❌ AUTH: Mensagem do erro geral:', error?.message);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userInfo');
        setUser(null);
      } finally {
        console.log('🔍 AUTH: Finalizando verificação, isLoading = false');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, senha: string) => {
    console.log('🔑 AUTH: Iniciando login no contexto...');
    try {
      const response = await ApiService.login(email, senha);
      console.log('🔑 AUTH: Login bem-sucedido:', response);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id);
      localStorage.setItem('userInfo', JSON.stringify(response.user));
      console.log('🔑 AUTH: Dados salvos no localStorage');
      
      // Atualizar o estado do usuário imediatamente
      setUser(response.user);
      console.log('🔑 AUTH: Usuário definido no contexto:', response.user);
      
      return response.user;
    } catch (error) {
      console.error('❌ AUTH: Erro no login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('❌ AUTH: useAuth chamado fora do AuthProvider!');
    console.error('❌ AUTH: Stack trace:', new Error().stack);
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}