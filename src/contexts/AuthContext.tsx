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
      try {
        const token = localStorage.getItem('token');
        const savedUserId = localStorage.getItem('userId');
        console.log('🔍 AUTH: Token encontrado:', !!token);
        console.log('🔍 AUTH: UserId encontrado:', !!savedUserId);
        
        if (token && savedUserId) {
          console.log('🔍 AUTH: Chamando getCurrentUser...');
          const response = await ApiService.getCurrentUser();
          console.log('🔍 AUTH: Resposta getCurrentUser:', response);
          setUser(response.user);
          console.log('🔍 AUTH: Usuário definido no contexto');
        } else {
          console.log('🔍 AUTH: Token ou UserId não encontrados');
        }
      } catch (error) {
        console.error('❌ AUTH: Erro ao verificar autenticação:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userInfo');
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
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}