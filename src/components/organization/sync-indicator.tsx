'use client'

import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useOrganizationStore } from '@/lib/stores'
import { formatDateTime } from '@/lib/utils/date-helpers'
import { cn } from '@/lib/utils'

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

interface SyncIndicatorProps {
  className?: string
}

export function SyncIndicator({ className }: SyncIndicatorProps) {
  const { 
    lastSyncAt, 
    isSyncing, 
    syncError, 
    syncQueue,
  } = useOrganizationStore()
  
  // Determine sync status
  let status: SyncStatus = 'synced'
  if (syncError) {
    status = 'error'
  } else if (isSyncing) {
    status = 'syncing'
  } else if (syncQueue.length > 0) {
    status = 'offline'
  }
  
  const getStatusIcon = () => {
    switch (status) {
      case 'syncing':
        return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'offline':
        return <CloudOff className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case 'synced':
      default:
        return <Check className="h-4 w-4 text-green-500" />
    }
  }
  
  const getStatusText = () => {
    switch (status) {
      case 'syncing':
        return 'Synchronisation...'
      case 'offline':
        return `${syncQueue.length} modification${syncQueue.length > 1 ? 's' : ''} en attente`
      case 'error':
        return 'Erreur de synchronisation'
      case 'synced':
      default:
        return lastSyncAt ? `Synchronisé ${formatDateTime(lastSyncAt)}` : 'Données locales'
    }
  }
  
  const getStatusColor = () => {
    switch (status) {
      case 'syncing':
        return 'text-blue-500'
      case 'offline':
        return 'text-amber-500'
      case 'error':
        return 'text-destructive'
      case 'synced':
      default:
        return 'text-green-500'
    }
  }
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-1.5 h-8', className)}
          disabled={isSyncing}
        >
          <Cloud className={cn('h-4 w-4', getStatusColor())} />
          {getStatusIcon()}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <div className="text-sm">
          <p className="font-medium">{getStatusText()}</p>
          {lastSyncAt && status !== 'syncing' && (
            <p className="text-xs text-muted-foreground mt-1">
              Dernière sync: {formatDateTime(lastSyncAt)}
            </p>
          )}
          {syncError && (
            <p className="text-xs text-destructive mt-1">
              {syncError}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
