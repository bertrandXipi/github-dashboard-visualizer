'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useActivityStore } from '@/lib/stores'
import { formatDate } from '@/lib/utils/date-helpers'

interface OfflineBannerProps {
  isOffline: boolean
  wasOffline: boolean
  onSync?: () => void
  onDismiss?: () => void
}

export function OfflineBanner({ isOffline, wasOffline, onSync, onDismiss }: OfflineBannerProps) {
  const { lastSync } = useActivityStore()
  
  if (!isOffline && !wasOffline) return null
  
  if (isOffline) {
    return (
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
          <WifiOff className="h-4 w-4" />
          <span>
            Mode hors ligne - Données du cache
            {lastSync && ` (${formatDate(lastSync, 'relative')})`}
          </span>
        </div>
      </div>
    )
  }
  
  // Was offline, now online - show sync prompt
  if (wasOffline) {
    return (
      <div className="bg-green-500/10 border-b border-green-500/20 px-4 py-2">
        <div className="flex items-center justify-center gap-3 text-sm">
          <span className="text-green-600 dark:text-green-400">
            Connexion rétablie !
          </span>
          <Button size="sm" variant="outline" onClick={onSync}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Synchroniser
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            Ignorer
          </Button>
        </div>
      </div>
    )
  }
  
  return null
}
