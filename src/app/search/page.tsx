'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ExternalLink, GitCommit, FolderGit2, Filter, X } from 'lucide-react'
import { subMonths, isWithinInterval, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { DashboardLayout } from '@/components/layout'
import { LoadingScreen } from '@/components/loading-screen'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore, useActivityStore, useSettingsStore } from '@/lib/stores'
import { formatDate } from '@/lib/utils/date-helpers'
import { formatCommitMessage } from '@/lib/utils/formatters'

type DateFilter = 'all' | 'today' | 'week' | 'month' | '3months'

export default function SearchPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, loadFromCache: loadAuth } = useAuthStore()
  const { commits, repositories, loadFromCache: loadActivity } = useActivityStore()
  const { loadFromCache: loadSettings } = useSettingsStore()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [languageFilter, setLanguageFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  
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
  
  // Get unique languages and projects
  const { languages, projects } = useMemo(() => {
    const langs = new Set<string>()
    const projs = new Set<string>()
    repositories.forEach(repo => {
      if (repo.language) langs.add(repo.language)
      projs.add(repo.name)
    })
    return { 
      languages: Array.from(langs).sort(),
      projects: Array.from(projs).sort()
    }
  }, [repositories])
  
  // Get date range for filter
  const getDateRange = (filter: DateFilter) => {
    const now = new Date()
    switch (filter) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) }
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) }
      case '3months':
        return { start: subMonths(now, 3), end: now }
      default:
        return null
    }
  }
  
  // Search results
  const results = useMemo(() => {
    let filteredCommits = [...commits]
    let filteredRepos = [...repositories]
    
    // Date filter
    const dateRange = getDateRange(dateFilter)
    if (dateRange) {
      filteredCommits = filteredCommits.filter(c => 
        isWithinInterval(new Date(c.date), dateRange)
      )
    }
    
    // Project filter
    if (projectFilter !== 'all') {
      filteredCommits = filteredCommits.filter(c => c.repoName === projectFilter)
      filteredRepos = filteredRepos.filter(r => r.name === projectFilter)
    }
    
    // Language filter
    if (languageFilter !== 'all') {
      const reposWithLang = repositories.filter(r => r.language === languageFilter).map(r => r.name)
      filteredCommits = filteredCommits.filter(c => reposWithLang.includes(c.repoName))
      filteredRepos = filteredRepos.filter(r => r.language === languageFilter)
    }
    
    // Search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filteredCommits = filteredCommits.filter(c => 
        c.message.toLowerCase().includes(searchTerm) ||
        c.repoName.toLowerCase().includes(searchTerm) ||
        c.filesChanged.some(f => f.toLowerCase().includes(searchTerm))
      )
      filteredRepos = filteredRepos.filter(r =>
        r.name.toLowerCase().includes(searchTerm) ||
        r.description?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Sort by date (most recent first)
    filteredCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    return { 
      commits: filteredCommits.slice(0, 50), 
      repos: filteredRepos.slice(0, 10) 
    }
  }, [query, commits, repositories, dateFilter, projectFilter, languageFilter])
  
  const hasActiveFilters = dateFilter !== 'all' || projectFilter !== 'all' || languageFilter !== 'all'
  
  const clearFilters = () => {
    setDateFilter('all')
    setProjectFilter('all')
    setLanguageFilter('all')
  }
  
  if (!isInitialized || authLoading) {
    return <LoadingScreen progress={10} stage="Chargement..." />
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  const totalResults = (results.commits?.length || 0) + (results.repos?.length || 0)
  
  return (
    <DashboardLayout showStatsPanel={false}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">Recherche</h1>
          <p className="text-muted-foreground">
            Recherche dans tes commits, projets et fichiers
          </p>
        </div>
        
        {/* Search bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans mes commits, projets, fichiers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
          
          {/* Filter toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
              {hasActiveFilters && (
                <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Effacer
              </Button>
            )}
          </div>
          
          {/* Filters */}
          {showFilters && (
            <Card>
              <CardContent className="p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Période</label>
                    <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tout</SelectItem>
                        <SelectItem value="today">Aujourd&apos;hui</SelectItem>
                        <SelectItem value="week">Cette semaine</SelectItem>
                        <SelectItem value="month">Ce mois</SelectItem>
                        <SelectItem value="3months">3 derniers mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Projet</label>
                    <Select value={projectFilter} onValueChange={setProjectFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les projets</SelectItem>
                        {projects.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Langage</label>
                    <Select value={languageFilter} onValueChange={setLanguageFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les langages</SelectItem>
                        {languages.map(l => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Results */}
        {query.trim() || hasActiveFilters ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {totalResults} résultat{totalResults !== 1 ? 's' : ''} trouvé{totalResults !== 1 ? 's' : ''}
            </p>
            
            {/* Repos */}
            {results.repos && results.repos.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium">Projets</h2>
                {results.repos.map((repo) => (
                  <Card key={repo.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <FolderGit2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{repo.name}</p>
                            {repo.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {repo.description}
                              </p>
                            )}
                            {repo.language && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {repo.language}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(repo.htmlUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Commits */}
            {results.commits && results.commits.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium">Commits</h2>
                {results.commits.map((commit) => (
                  <Card key={commit.sha}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <GitCommit className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm">
                              {formatCommitMessage(commit.message, 80)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {commit.repoName}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(commit.date, 'relative')}
                              </span>
                              {commit.filesChanged.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  • {commit.filesChanged.length} fichier{commit.filesChanged.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(commit.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {totalResults === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Aucun résultat trouvé
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Tape quelque chose pour rechercher
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setQuery('fix')}>
                fix
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuery('feat')}>
                feat
              </Button>
              <Button variant="outline" size="sm" onClick={() => setQuery('refactor')}>
                refactor
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
