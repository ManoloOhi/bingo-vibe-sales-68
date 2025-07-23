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
      try {
        const savedUserId = localStorage.getItem('userId');
        if (savedUserId) {
          const response = await ApiService.getCurrentUser(savedUserId);
          setUser(response.user);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('userId');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const response = await ApiService.login(email, senha);
      setUser(response.user);
      localStorage.setItem('userId', response.user.id);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
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