'use client'

import { useState } from 'react'
import { ExternalLink, GitCommit, Star, GitFork, Sparkles, Loader2, FolderOpen, Pin, FileText, ListTodo, Circle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { MiniActivityGraph } from '@/components/charts/mini-activity-graph'
import { CloneModal } from './clone-modal'
import { TagBadge, CloneStatusBadge } from '@/components/organization'
import { getStatusColor, getStatusLabel } from '@/lib/utils/calculations'
import { formatDate } from '@/lib/utils/date-helpers'
import { formatCommitMessage, getLanguageColor, formatNumber } from '@/lib/utils/formatters'
import { useActivityStore, useAuthStore, useOrganizationStore } from '@/lib/stores'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Repository } from '@/types'
import { MANUAL_STATUS_LABELS, MANUAL_STATUS_COLORS } from '@/types'

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
    id,
    name, 
    fullName,
    description, 
    language, 
    status, 
    stars, 
    forks,
    lastCommitDate,
    htmlUrl,
    aiSummary 
  } = repository
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOpening, setIsOpening] = useState(false)
  const [showCloneModal, setShowCloneModal] = useState(false)
  const { updateRepoSummary } = useActivityStore()
  const { username, getDecryptedToken } = useAuthStore()
  
  // Organization data
  const { 
    tags, 
    projectOrganizations, 
    notes,
    toggleFavorite, 
    togglePin,
    getIncompleteTodoCount,
  } = useOrganizationStore()
  
  const org = projectOrganizations[id]
  const projectTags = tags.filter(t => org?.tagIds.includes(t.id))
  const hasNote = !!notes[id]
  const incompleteTodos = getIncompleteTodoCount(id)
  
  const handleGenerateSummary = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isGenerating || !username) return
    
    setIsGenerating(true)
    try {
      const token = await getDecryptedToken()
      
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: name,
          repoId: id,
          owner: username,
          description,
          language,
          token: token || undefined,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate summary')
      }
      
      const { summary } = await response.json()
      updateRepoSummary(id, summary)
      toast.success('Résumé généré !')
    } catch (error) {
      console.error('Error generating summary:', error)
      toast.error('Erreur lors de la génération du résumé')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleOpenInKiro = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isOpening) return
    
    setIsOpening(true)
    try {
      const response = await fetch('/api/open-in-kiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: name }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 404) {
          setShowCloneModal(true)
        } else {
          throw new Error(data.message || data.error)
        }
        return
      }
      
      toast.success('Ouverture dans Kiro...')
    } catch (error: any) {
      console.error('Error opening in Kiro:', error)
      toast.error(error.message || 'Erreur')
    } finally {
      setIsOpening(false)
    }
  }
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleFavorite(id)
  }
  
  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    const success = togglePin(id)
    if (!success && !org?.isPinned) {
      toast.error('Maximum 5 projets épinglés')
    }
  }
  
  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-shadow cursor-pointer group relative',
        org?.isPinned && 'ring-2 ring-primary/50'
      )}
      onClick={onCardClick}
    >
      <CardContent className="p-4 space-y-3">
        {/* Quick actions on hover */}
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleToggleFavorite}
              >
                <Star 
                  className={cn(
                    'h-4 w-4',
                    org?.isFavorite && 'fill-yellow-400 text-yellow-400'
                  )} 
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {org?.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleTogglePin}
              >
                <Pin 
                  className={cn(
                    'h-4 w-4',
                    org?.isPinned && 'fill-primary text-primary'
                  )} 
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {org?.isPinned ? 'Désépingler' : 'Épingler'}
            </TooltipContent>
          </Tooltip>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation()
              window.open(htmlUrl, '_blank')
            }}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Header */}
        <div className="flex items-start justify-between pr-20">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-medium truncate">{name}</h3>
              
              {/* Manual status badge */}
              {org?.manualStatus ? (
                <Badge 
                  variant="secondary" 
                  className="text-xs text-white"
                  style={{ backgroundColor: MANUAL_STATUS_COLORS[org.manualStatus] }}
                >
                  {MANUAL_STATUS_LABELS[org.manualStatus]}
                </Badge>
              ) : (
                <Badge 
                  variant="secondary" 
                  className={`text-xs text-white ${getStatusColor(status)}`}
                >
                  {getStatusLabel(status)}
                </Badge>
              )}
              
              {/* Favorite indicator (always visible) */}
              {org?.isFavorite && (
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              )}
              
              {/* Pin indicator (always visible) */}
              {org?.isPinned && (
                <Pin className="h-3.5 w-3.5 fill-primary text-primary" />
              )}
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
        </div>
        
        {/* Tags */}
        {projectTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {projectTags.map(tag => (
              <TagBadge key={tag.id} tag={tag} size="sm" />
            ))}
          </div>
        )}
        
        {/* Organization indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <CloneStatusBadge projectId={id} />
          
          {hasNote && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 text-xs">
                  <FileText className="h-3 w-3" />
                  Note
                </Badge>
              </TooltipTrigger>
              <TooltipContent>Ce projet a une note</TooltipContent>
            </Tooltip>
          )}
          
          {incompleteTodos > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="gap-1 text-xs">
                  <ListTodo className="h-3 w-3" />
                  {incompleteTodos}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {incompleteTodos} tâche{incompleteTodos > 1 ? 's' : ''} restante{incompleteTodos > 1 ? 's' : ''}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        {/* Open in Kiro button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={handleOpenInKiro}
          disabled={isOpening}
        >
          {isOpening ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <FolderOpen className="h-3 w-3 mr-1" />
          )}
          Ouvrir dans Kiro
        </Button>
        
        {/* AI Summary or Description */}
        {aiSummary ? (
          <div className="space-y-1">
            <p className="text-sm text-foreground line-clamp-3">
              {aiSummary}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-muted-foreground hover:text-foreground p-0"
              onClick={handleGenerateSummary}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3 mr-1" />
              )}
              {isGenerating ? 'Régénération...' : 'Régénérer'}
            </Button>
          </div>
        ) : description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        ) : null}
        
        {/* Generate summary button */}
        {!aiSummary && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={handleGenerateSummary}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            {isGenerating ? 'Génération...' : 'Générer un résumé IA'}
          </Button>
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
      
      {/* Clone Modal */}
      <CloneModal
        open={showCloneModal}
        onOpenChange={setShowCloneModal}
        projectName={name}
        githubUrl={htmlUrl}
      />
    </Card>
  )
}
