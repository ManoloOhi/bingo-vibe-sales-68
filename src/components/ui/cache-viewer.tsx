import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/hooks/useQueryData'

export function CacheViewer() {
  const queryClient = useQueryClient()
  
  const getCacheContent = () => {
    const cache = queryClient.getQueryCache()
    const queries = cache.getAll()
    
    return queries.map(query => ({
      queryKey: JSON.stringify(query.queryKey),
      dataSize: query.state.data ? JSON.stringify(query.state.data).length : 0,
      status: query.state.status,
      lastUpdated: query.state.dataUpdatedAt ? new Date(query.state.dataUpdatedAt).toLocaleTimeString() : 'Never',
      error: query.state.error?.message,
      fetchCount: query.state.fetchFailureCount + (query.state.data ? 1 : 0)
    }))
  }

  const cacheData = getCacheContent()

  return (
    <div className="space-y-4 p-4 max-h-96 overflow-y-auto">
      <h3 className="font-semibold">Cache do React Query</h3>
      
      <div className="text-sm space-y-2">
        <div><strong>Total de queries:</strong> {cacheData.length}</div>
        <div><strong>Dados totais:</strong> {Math.round(cacheData.reduce((acc, q) => acc + q.dataSize, 0) / 1024 * 100) / 100} KB</div>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm">Queries em Cache:</h4>
        {cacheData.map((query, index) => (
          <div key={index} className="border rounded p-2 text-xs space-y-1">
            <div><strong>Key:</strong> {query.queryKey}</div>
            <div className="flex gap-4">
              <span>Status: <span className={`px-1 rounded ${
                query.status === 'success' ? 'bg-green-100 text-green-800' :
                query.status === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>{query.status}</span></span>
              <span>Tamanho: {Math.round(query.dataSize / 1024 * 100) / 100} KB</span>
              <span>Atualizado: {query.lastUpdated}</span>
            </div>
            {query.error && (
              <div className="text-red-600">Erro: {query.error}</div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t pt-2">
        <h4 className="font-medium text-sm mb-2">Query Keys Configuradas:</h4>
        <div className="text-xs space-y-1">
          <div>• <code>bingos</code> - Lista de todos os bingos</div>
          <div>• <code>bingo(id)</code> - Bingo específico por ID</div>
          <div>• <code>vendedores</code> - Lista de todos os vendedores</div>
          <div>• <code>vendedor(id)</code> - Vendedor específico por ID</div>
          <div>• <code>pedidos</code> - Lista de todos os pedidos</div>
          <div>• <code>pedido(id)</code> - Pedido específico por ID</div>
          <div>• <code>pedidosByVendedor(vendedorId)</code> - Pedidos por vendedor</div>
          <div>• <code>pedidosByBingo(bingoId)</code> - Pedidos por bingo</div>
        </div>
      </div>
    </div>
  )
}