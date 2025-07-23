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
  login: (email: string, senha: string) => Promise<void>;
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
    try {
      const response = await ApiService.login(email, senha);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('userId', response.user.id);
    } catch (error) {
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