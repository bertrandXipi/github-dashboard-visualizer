'use client'

import { ExternalLink, GitCommit, Star, GitFork } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MiniActivityGraph } from '@/components/charts/mini-activity-graph'
import { getStatusColor, getStatusLabel } from '@/lib/utils/calculations'
import { formatDate } from '@/lib/utils/date-helpers'
import { formatCommitMessage, getLanguageColor, formatNumber } from '@/lib/utils/formatters'
import type { Repository } from '@/types'

interface ProjectCardProps {
  repository: Repository
  activityData: number[]
  lastCommitMessage?: string
  onCardClick: () => void
}

export function ProjectCard({ 
  repository, 
  activityData, 
  lastCommitMessage,
  onCardClick 
}: ProjectCardProps) {
  const { 
    name, 
    description, 
    language, 
    status, 
    stars, 
    forks,
    lastCommitDate,
    htmlUrl 
  } = repository
  
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onCardClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{name}</h3>
              <Badge 
                variant="secondary" 
                className={`text-xs text-white ${getStatusColor(status)}`}
              >
                {getStatusLabel(status)}
              </Badge>
            </div>
            {language && (
              <div className="flex items-center gap-1 mt-1">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getLanguageColor(language) }}
                />
                <span className="text-xs text-muted-foreground">{language}</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              window.open(htmlUrl, '_blank')
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
        
        {/* Last activity */}
        <div className="text-xs text-muted-foreground">
          {lastCommitDate ? (
            <span>Dernière activité : {formatDate(lastCommitDate, 'relative')}</span>
          ) : (
            <span>Pas d&apos;activité récente</span>
          )}
        </div>
        
        {/* Last commit message */}
        {lastCommitMessage && (
          <div className="flex items-start gap-2 text-xs">
            <GitCommit className="h-3 w-3 mt-0.5 text-muted-foreground" />
            <span className="text-muted-foreground truncate">
              {formatCommitMessage(lastCommitMessage, 50)}
            </span>
          </div>
        )}
        
        {/* Activity graph */}
        <MiniActivityGraph data={activityData} height={24} />
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            {formatNumber(stars)}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="h-3 w-3" />
            {formatNumber(forks)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
