import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ApiService } from '@/services/apiService';

export function ApiStatus() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        await ApiService.healthCheck();
        setStatus('connected');
        setError('');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (status === 'connecting') {
    return (
      <Badge variant="secondary" className="animate-pulse">
        🔄 Conectando à API...
      </Badge>
    );
  }

  if (status === 'connected') {
    return (
      <Badge variant="secondary" className="bg-success text-success-foreground">
        ✅ API Conectada
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" title={error}>
      ❌ API Offline
    </Badge>
  );
}