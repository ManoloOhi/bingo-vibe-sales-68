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
  console.log('🔍 Cache Info:', {
    ...info,
    cacheSizeKB: Math.round(info.cacheSize / 1024 * 100) / 100,
    sessionStorageUsage: `${Object.keys(sessionStorage).length} items`
  });
};