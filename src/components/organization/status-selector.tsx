'use client'

import { Check, X, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useOrganizationStore } from '@/lib/stores'
import { cn } from '@/lib/utils'
import type { ManualStatus } from '@/types'
import { MANUAL_STATUS_LABELS, MANUAL_STATUS_COLORS } from '@/types'

interface StatusSelectorProps {
  projectId: number
  className?: string
}

const STATUS_OPTIONS: ManualStatus[] = ['en-cours', 'en-pause', 'termine', 'abandonne']

export function StatusSelector({ projectId, className }: StatusSelectorProps) {
  const { projectOrganizations, setManualStatus } = useOrganizationStore()
  
  const currentStatus = projectOrganizations[projectId]?.manualStatus
  
  const handleSelect = (status: ManualStatus | null) => {
    setManualStatus(projectId, status)
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn('gap-1.5', className)}
        >
          <Circle 
            className="h-3 w-3" 
            fill={currentStatus ? MANUAL_STATUS_COLORS[currentStatus] : 'transparent'}
            stroke={currentStatus ? MANUAL_STATUS_COLORS[currentStatus] : 'currentColor'}
          />
          {currentStatus ? MANUAL_STATUS_LABELS[currentStatus] : 'Statut'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {STATUS_OPTIONS.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => handleSelect(status)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Circle 
                className="h-3 w-3" 
                fill={MANUAL_STATUS_COLORS[status]}
                stroke={MANUAL_STATUS_COLORS[status]}
              />
              {MANUAL_STATUS_LABELS[status]}
            </div>
            {currentStatus === status && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
        {currentStatus && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleSelect(null)}
              className="cursor-pointer text-muted-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Effacer le statut
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
