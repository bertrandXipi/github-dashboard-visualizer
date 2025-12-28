'use client'

import { useState } from 'react'
import { ExternalLink, FolderOpen, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore, useActivityStore } from '@/lib/stores'
import { formatDate } from '@/lib/utils/date-helpers'
import { toast } from 'sonner'
import type { Repository } from '@/types'

interface ProjectListItemProps {
  repository: Repository
  lastCommitMessage?: string
  onCardClick?: () => void
}

export function ProjectListItem({ repository, lastCommitMessage, onCardClick }: ProjectListItemProps) {
  const { username, getDecryptedToken } = useAuthStore()
  const { updateRepoSummary } = useActivityStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  const handleOpenInKiro = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpening(true)
    try {
      const response = await fetch('/api/open-in-kiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: repository.name }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 404) {
          toast.error(`Projet "${repository.name}" non trouvé localement`)
        } else {
          toast.error(data.error || 'Erreur')
        }
      } else {
        toast.success(`Ouverture de ${repository.name} dans Kiro`)
      }
    } catch {
      toast.error('Erreur lors de l\'ouverture')
    } finally {
      setIsOpening(false)
    }
  }

  const handleGenerateSummary = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!username) return
    setIsGenerating(true)
    try {
      const token = await getDecryptedToken()
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName: repository.name,
          repoId: repository.id,
          owner: username,
          description: repository.description,
          language: repository.language,
          token: token || undefined,
        }),
      })
      if (response.ok) {
        const { summary } = await response.json()
        updateRepoSummary(repository.id, summary)
        toast.success('Résumé généré !')
      } else {
        toast.error('Erreur lors de la génération')
      }
    } catch {
      toast.error('Erreur lors de la génération')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div
      className="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={onCardClick}
    >
      {/* Name & Description */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{repository.name}</span>
          <Badge variant={repository.status === 'active' ? 'default' : 'secondary'} className="text-xs shrink-0">
            {repository.status === 'active' ? 'Actif' : repository.status === 'archived' ? 'Archivé' : 'Inactif'}
          </Badge>
          {repository.language && (
            <span className="text-xs text-muted-foreground shrink-0">• {repository.language}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
          {repository.aiSummary || lastCommitMessage || repository.description || ''}
        </p>
      </div>

      {/* Last activity */}
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {repository.lastCommitDate && formatDate(repository.lastCommitDate)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenInKiro}
          disabled={isOpening}
          title="Ouvrir dans Kiro"
        >
          {isOpening ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderOpen className="h-4 w-4" />}
        </Button>
        
        {!repository.aiSummary && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            title="Générer résumé IA"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            window.open(repository.htmlUrl, '_blank')
          }}
          title="Voir sur GitHub"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
