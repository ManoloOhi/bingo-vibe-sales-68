import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}