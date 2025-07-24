import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useQueryPersister() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Auto-persistir no sessionStorage quando dados mudarem
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      // Debounce para evitar muitas escritas
      setTimeout(() => {
        try {
          const queries = queryClient.getQueryCache().getAll()
          const cacheData = {
            timestamp: Date.now(),
            queries: queries.map(query => ({
              queryKey: query.queryKey,
              state: query.state,
              data: query.state.data
            }))
          }
          
          sessionStorage.setItem('BINGO_CACHE_KEY', JSON.stringify(cacheData))
          console.log('💾 Cache persistido:', queries.length, 'queries')
          
          // Salvar info para debug
          sessionStorage.setItem('BINGO_CACHE_INFO', JSON.stringify({
            timestamp: Date.now(),
            queries: queries.length
          }))
          
        } catch (error) {
          console.error('❌ Erro ao persistir cache:', error)
        }
      }, 1000)
    })

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [queryClient])
}