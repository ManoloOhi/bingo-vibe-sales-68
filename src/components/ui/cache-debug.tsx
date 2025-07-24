import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Info, RefreshCw, Eye } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { clearAppCache, getCacheInfo, debugCache } from '@/utils/cacheUtils'
import { CacheViewer } from '@/components/ui/cache-viewer'
import { useToast } from '@/hooks/use-toast'

export function CacheDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [cacheInfo, setCacheInfo] = useState(getCacheInfo())

  const refreshCacheInfo = () => {
    setCacheInfo(getCacheInfo())
    debugCache()
  }

  const handleClearCache = () => {
    clearAppCache()
    queryClient.clear()
    refreshCacheInfo()
    toast({
      title: "Cache limpo",
      description: "Todos os dados em cache foram removidos"
    })
  }

  const handleInvalidateAll = () => {
    queryClient.invalidateQueries()
    refreshCacheInfo()
    toast({
      title: "Cache invalidado",
      description: "Todos os dados serão recarregados"
    })
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50"
      >
        <Info size={16} />
        Cache
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 p-4 max-w-sm">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Cache Debug</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            ×
          </Button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={cacheInfo.hasCache ? "default" : "secondary"}>
              {cacheInfo.hasCache ? "Ativo" : "Vazio"}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Queries:</span>
            <span>{cacheInfo.cacheKeys}</span>
          </div>
          <div className="flex justify-between">
            <span>Tamanho:</span>
            <span>{Math.round(cacheInfo.cacheSize / 1024 * 100) / 100} KB</span>
          </div>
          <div className="flex justify-between">
            <span>Atualização:</span>
            <span className="text-xs">{cacheInfo.lastUpdate}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshCacheInfo}
            className="flex-1"
          >
            <RefreshCw size={14} />
            Info
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowViewer(!showViewer)}
            className="flex-1"
          >
            <Eye size={14} />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleInvalidateAll}
            className="flex-1"
          >
            <RefreshCw size={14} />
            Invalidar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearCache}
            className="flex-1"
          >
            <Trash2 size={14} />
            Limpar
          </Button>
        </div>

        {showViewer && (
          <div className="mt-4 border-t pt-4">
            <CacheViewer />
          </div>
        )}
      </div>
    </Card>
  )
}