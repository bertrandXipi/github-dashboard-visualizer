'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout'
import { ProjectCard, ProjectFilters, ProjectModal, ProjectListItem } from '@/components/projects'
import type { ExtendedFilters } from '@/components/projects/project-filters'
import { LoadingScreen } from '@/components/loading-screen'
import { Button } from '@/components/ui/button'
import { useAuthStore, useActivityStore, useSettingsStore, useOrganizationStore } from '@/lib/stores'
import { useProjectShortcuts } from '@/hooks'
import { getRepoActivityData } from '@/lib/utils/calculations'
import { 
  sortProjectsByOrganization, 
  filterProjectsByTags, 
  filterProjectsByStatus,
  filterProjectsByCloneStatus,
  filterProjectsByFavorite,
} from '@/lib/utils/organization'
import { toast } from 'sonner'
import type { Repository } from '@/types'

const defaultFilters: ExtendedFilters = {
  search: '',
  status: 'all',
  language: 'all',
  sortBy: 'lastActivity',
  sortOrder: 'desc',
  tagIds: [],
  manualStatus: 'all',
  favoritesOnly: false,
  cloneStatus: 'all',
}

export default function ProjectsPage() {
  const router = useRouter()
  const { username, isAuthenticated, isLoading: authLoading, loadFromCache: loadAuth, getDecryptedToken } = useAuthStore()
  const { repositories, commits, loadFromCache: loadActivity, updateRepoSummary, syncWithGitHub } = useActivityStore()
  const { loadFromCache: loadSettings } = useSettingsStore()
  const { 
    projectOrganizations, 
    machineInfo,
    loadFromCache: loadOrganization,
    isInitialized: orgInitialized,
    toggleFavorite,
    togglePin,
  } = useOrganizationStore()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [filters, setFilters] = useState<ExtendedFilters>(defaultFilters)
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [isGeneratingAll, setIsGeneratingAll] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Keyboard shortcuts for selected project
  useProjectShortcuts({
    projectId: selectedRepo?.id ?? null,
    onToggleFavorite: (projectId) => {
      toggleFavorite(projectId)
      const org = projectOrganizations[projectId]
      const isFavorite = !org?.isFavorite
      toast.success(isFavorite ? 'Ajouté aux favoris' : 'Retiré des favoris')
    },
    onTogglePin: (projectId) => {
      const success = togglePin(projectId)
      if (success) {
        const org = projectOrganizations[projectId]
        const isPinned = !org?.isPinned
        toast.success(isPinned ? 'Projet épinglé' : 'Projet désépinglé')
      } else {
        toast.error('Maximum 5 projets épinglés')
      }
      return success
    },
    enabled: modalOpen && selectedRepo !== null,
  })
  
  // Handle refresh
  const handleRefresh = async () => {
    if (!username) return
    setIsRefreshing(true)
    try {
      const token = await getDecryptedToken()
      await syncWithGitHub(username, token || undefined)
      toast.success('Données mises à jour !')
    } catch (error) {
      toast.error('Erreur lors de la synchronisation')
    } finally {
      setIsRefreshing(false)
    }
  }
  
  // Initialize
  useEffect(() => {
    const init = async () => {
      await loadAuth()
      loadSettings()
      loadActivity()
      loadOrganization()
      setIsInitialized(true)
    }
    init()
  }, [loadAuth, loadSettings, loadActivity, loadOrganization])
  
  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isInitialized, authLoading, isAuthenticated, router])
  
  // Get unique languages
  const languages = useMemo(() => {
    const langs = new Set<string>()
    repositories.forEach(repo => {
      if (repo.language) langs.add(repo.language)
    })
    return Array.from(langs).sort()
  }, [repositories])
  
  // Count repos without summary
  const reposWithoutSummary = useMemo(() => 
    repositories.filter(r => !r.aiSummary),
    [repositories]
  )
  
  // Generate all summaries
  const handleGenerateAll = async () => {
    if (isGeneratingAll || !username) return
    
    const toGenerate = reposWithoutSummary.slice(0, 20) // Limit to 20 at a time
    if (toGenerate.length === 0) {
      toast.info('Tous les projets ont déjà un résumé')
      return
    }
    
    setIsGeneratingAll(true)
    setGenerationProgress({ current: 0, total: toGenerate.length })
    
    const token = await getDecryptedToken()
    let successCount = 0
    
    for (let i = 0; i < toGenerate.length; i++) {
      const repo = toGenerate[i]
      setGenerationProgress({ current: i + 1, total: toGenerate.length })
      
      try {
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoName: repo.name,
            owner: username,
            description: repo.description,
            language: repo.language,
            token: token || undefined,
          }),
        })
        
        if (response.ok) {
          const { summary } = await response.json()
          updateRepoSummary(repo.id, summary)
          successCount++
        }
      } catch (error) {
        console.error(`Error generating summary for ${repo.name}:`, error)
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    setIsGeneratingAll(false)
    toast.success(`${successCount} résumé${successCount > 1 ? 's' : ''} généré${successCount > 1 ? 's' : ''} !`)
  }
  
  // Filter and sort repositories
  const filteredRepos = useMemo(() => {
    let result = [...repositories]
    
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(repo => 
        repo.name.toLowerCase().includes(search) ||
        repo.description?.toLowerCase().includes(search) ||
        repo.aiSummary?.toLowerCase().includes(search)
      )
    }
    
    // Status filter (GitHub activity status)
    if (filters.status !== 'all') {
      result = result.filter(repo => repo.status === filters.status)
    }
    
    // Language filter
    if (filters.language !== 'all') {
      result = result.filter(repo => repo.language === filters.language)
    }
    
    // Organization filters
    if (filters.tagIds.length > 0) {
      result = filterProjectsByTags(result, projectOrganizations, filters.tagIds)
    }
    
    if (filters.manualStatus !== 'all') {
      result = filterProjectsByStatus(result, projectOrganizations, filters.manualStatus)
    }
    
    if (filters.favoritesOnly) {
      result = filterProjectsByFavorite(result, projectOrganizations, true)
    }
    
    if (filters.cloneStatus !== 'all' && machineInfo) {
      result = filterProjectsByCloneStatus(
        result, 
        projectOrganizations, 
        machineInfo.id, 
        filters.cloneStatus === 'cloned'
      )
    }
    
    // Sort by organization first (pinned > favorites > others)
    result = sortProjectsByOrganization(result, projectOrganizations)
    
    // Then apply secondary sort
    result.sort((a, b) => {
      // Keep organization sort as primary
      const orgA = projectOrganizations[a.id] || { isPinned: false, isFavorite: false }
      const orgB = projectOrganizations[b.id] || { isPinned: false, isFavorite: false }
      
      // If both have same org priority, apply secondary sort
      if (orgA.isPinned === orgB.isPinned && orgA.isFavorite === orgB.isFavorite) {
        let comparison = 0
        switch (filters.sortBy) {
          case 'lastActivity':
            comparison = new Date(b.lastCommitDate || 0).getTime() - 
                         new Date(a.lastCommitDate || 0).getTime()
            break
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'stars':
            comparison = b.stars - a.stars
            break
          case 'commits':
            const aCommits = commits.filter(c => c.repoName === a.name).length
            const bCommits = commits.filter(c => c.repoName === b.name).length
            comparison = bCommits - aCommits
            break
        }
        return filters.sortOrder === 'desc' ? comparison : -comparison
      }
      
      return 0 // Keep organization sort order
    })
    
    // Limit to 100
    return result.slice(0, 100)
  }, [repositories, commits, filters, projectOrganizations, machineInfo])
  
  // Get last commit message for each repo
  const getLastCommitMessage = (repoName: string) => {
    const repoCommits = commits.filter(c => c.repoName === repoName)
    return repoCommits[0]?.message
  }
  
  if (!isInitialized || authLoading) {
    return <LoadingScreen progress={10} stage="Chargement..." />
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <DashboardLayout showStatsPanel={false} onRefresh={handleRefresh} isRefreshing={isRefreshing}>
      <div className="space-y-6 w-full max-w-full overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mes Projets</h1>
            <p className="text-muted-foreground">
              {repositories.length} projet{repositories.length !== 1 ? 's' : ''} au total
              {reposWithoutSummary.length > 0 && (
                <span> • {reposWithoutSummary.length} sans résumé</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {reposWithoutSummary.length > 0 && (
              <Button
                onClick={handleGenerateAll}
                disabled={isGeneratingAll}
                variant="outline"
              >
                {isGeneratingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {generationProgress.current}/{generationProgress.total}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer tous les résumés
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        <ProjectFilters
          filters={filters}
          languages={languages}
          onFiltersChange={setFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        {filteredRepos.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRepos.map((repo) => (
                <ProjectCard
                  key={repo.id}
                  repository={repo}
                  activityData={getRepoActivityData(commits, repo.name, 30)}
                  lastCommitMessage={getLastCommitMessage(repo.name)}
                  onCardClick={() => {
                    setSelectedRepo(repo)
                    setModalOpen(true)
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2 w-full overflow-hidden">
              {filteredRepos.map((repo) => (
                <ProjectListItem
                  key={repo.id}
                  repository={repo}
                  lastCommitMessage={getLastCommitMessage(repo.name)}
                  onCardClick={() => {
                    setSelectedRepo(repo)
                    setModalOpen(true)
                  }}
                />
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucun projet ne correspond à tes filtres
            </p>
          </div>
        )}
        
        <ProjectModal
          repository={selectedRepo}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </div>
    </DashboardLayout>
  )
}
