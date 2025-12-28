'use client'

import { HardDrive, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useOrganizationStore } from '@/lib/stores'
import { cn } from '@/lib/utils'

interface CloneStatusProps {
  projectId: number
  showLabel?: boolean
  className?: string
}

export function CloneStatus({ projectId, showLabel = true, className }: CloneStatusProps) {
  const { projectOrganizations, machineInfo, toggleCloneStatus } = useOrganizationStore()
  
  const org = projectOrganizations[projectId]
  const isClonedHere = machineInfo && org?.clonedOnMachines.includes(machineInfo.id)
  const clonedCount = org?.clonedOnMachines.length || 0
  
  const handleToggle = () => {
    toggleCloneStatus(projectId)
  }
  
  if (!showLabel) {
    // Compact badge version for project cards
    if (!isClonedHere) return null
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={cn('gap-1', className)}>
            <HardDrive className="h-3 w-3" />
            local
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          Cloné sur cette machine
        </TooltipContent>
      </Tooltip>
    )
  }
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant={isClonedHere ? 'default' : 'outline'}
        size="sm"
        onClick={handleToggle}
        className="gap-1.5"
      >
        <HardDrive className="h-3.5 w-3.5" />
        {isClonedHere ? (
          <>
            <Check className="h-3.5 w-3.5" />
            Cloné ici
          </>
        ) : (
          'Marquer comme cloné'
        )}
      </Button>
      
      {clonedCount > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground">
              {clonedCount} machine{clonedCount > 1 ? 's' : ''}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            Ce projet est cloné sur {clonedCount} machine{clonedCount > 1 ? 's' : ''}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

/**
 * Simple badge to show clone status on cards
 */
export function CloneStatusBadge({ projectId, className }: { projectId: number; className?: string }) {
  return <CloneStatus projectId={projectId} showLabel={false} className={className} />
}
