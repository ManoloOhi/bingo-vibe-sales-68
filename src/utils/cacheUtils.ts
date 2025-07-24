// Utilitários para gerenciamento de cache

export const clearAppCache = () => {
  // Limpar sessionStorage do React Query
  sessionStorage.removeItem('BINGO_CACHE_KEY');
  sessionStorage.removeItem('BINGO_CACHE_INFO');
  
  console.log('🧹 Cache limpo completamente');
};

export const getCacheInfo = () => {
  const cacheData = sessionStorage.getItem('BINGO_CACHE_KEY');
  const cacheInfo = sessionStorage.getItem('BINGO_CACHE_INFO');
  
  let parsedInfo = null;
  try {
    parsedInfo = cacheInfo ? JSON.parse(cacheInfo) : null;
  } catch (e) {
    parsedInfo = null;
  }
  
  return {
    hasCache: !!cacheData,
    cacheSize: cacheData ? new Blob([cacheData]).size : 0,
    cacheKeys: parsedInfo?.queries || 0,
    lastUpdate: parsedInfo?.timestamp ? new Date(parsedInfo.timestamp).toLocaleTimeString() : 'N/A'
  };
};

// Função para debug do cache
export const debugCache = () => {
  const info = getCacheInfo();
  const sessionKeys = Object.keys(sessionStorage);
  
  console.log('🔍 Cache Info:', {
    ...info,
    cacheSizeKB: Math.round(info.cacheSize / 1024 * 100) / 100,
    sessionStorageUsage: `${sessionKeys.length} items`,
    sessionStorageKeys: sessionKeys,
    cacheContent: sessionStorage.getItem('BINGO_CACHE_KEY') ? 'Dados presentes' : 'Vazio'
  });
  
  // Mostrar o que está armazenado especificamente
  console.log('📦 Dados em Cache (SessionStorage):');
  sessionKeys.forEach(key => {
    const value = sessionStorage.getItem(key);
    if (value) {
      console.log(`- ${key}: ${Math.round(new Blob([value]).size / 1024 * 100) / 100} KB`);
    }
  });
};