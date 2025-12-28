'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { ProjectCard, ProjectFilters } from '@/components/projects'
import { LoadingScreen } from '@/components/loading-screen'
import { useAuthStore, useActivityStore, useSettingsStore } from '@/lib/stores'
import { getRepoActivityData } from '@/lib/utils/calculations'
import type { RepositoryFilters } from '@/types'

const defaultFilters: RepositoryFilters = {
  search: '',
  status: 'all',
  language: 'all',
  sortBy: 'lastActivity',
  sortOrder: 'desc',
}

export default function ProjectsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, loadFromCache: loadAuth } = useAuthStore()
  const { repositories, commits, loadFromCache: loadActivity } = useActivityStore()
  const { loadFromCache: loadSettings } = useSettingsStore()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [filters, setFilters] = useState<RepositoryFilters>(defaultFilters)
  
  // Initialize
  useEffect(() => {
    const init = async () => {
      await loadAuth()
      loadSettings()
      loadActivity()
      setIsInitialized(true)
    }
    init()
  }, [loadAuth, loadSettings, loadActivity])
  
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
  
  // Filter and sort repositories
  const filteredRepos = useMemo(() => {
    let result = [...repositories]
    
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(repo => 
        repo.name.toLowerCase().includes(search) ||
        repo.description?.toLowerCase().includes(search)
      )
    }
    
    // Status filter
    if (filters.status !== 'all') {
      result = result.filter(repo => repo.status === filters.status)
    }
    
    // Language filter
    if (filters.language !== 'all') {
      result = result.filter(repo => repo.language === filters.language)
    }
    
    // Sort
    result.sort((a, b) => {
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
    })
    
    // Limit to 100
    return result.slice(0, 100)
  }, [repositories, commits, filters])
  
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
    <DashboardLayout showStatsPanel={false}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mes Projets</h1>
          <p className="text-muted-foreground">
            {repositories.length} projet{repositories.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        
        <ProjectFilters
          filters={filters}
          languages={languages}
          onFiltersChange={setFilters}
        />
        
        {filteredRepos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRepos.map((repo) => (
              <ProjectCard
                key={repo.id}
                repository={repo}
                activityData={getRepoActivityData(commits, repo.name, 30)}
                lastCommitMessage={getLastCommitMessage(repo.name)}
                onCardClick={() => {
                  // TODO: Open modal
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucun projet ne correspond à tes filtres
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
