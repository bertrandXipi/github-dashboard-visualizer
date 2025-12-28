'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ExternalLink, GitCommit, FolderGit2 } from 'lucide-react'
import { DashboardLayout } from '@/components/layout'
import { LoadingScreen } from '@/components/loading-screen'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore, useActivityStore, useSettingsStore } from '@/lib/stores'
import { formatDate } from '@/lib/utils/date-helpers'
import { formatCommitMessage } from '@/lib/utils/formatters'

export default function SearchPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, loadFromCache: loadAuth } = useAuthStore()
  const { commits, repositories, loadFromCache: loadActivity } = useActivityStore()
  const { loadFromCache: loadSettings } = useSettingsStore()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [query, setQuery] = useState('')
  
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
  
  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return { commits: [], repos: [] }
    
    const searchTerm = query.toLowerCase()
    const matchedCommits = commits
      .filter(c => 
        c.message.toLowerCase().includes(searchTerm) ||
        c.repoName.toLowerCase().includes(searchTerm) ||
        c.filesChanged.some(f => f.toLowerCase().includes(searchTerm))
      )
      .slice(0, 50)
    
    const matchedRepos = repositories
      .filter(r =>
        r.name.toLowerCase().includes(searchTerm) ||
        r.description?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10)
    
    return { commits: matchedCommits, repos: matchedRepos }
  }, [query, commits, repositories])
  
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
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans mes commits, projets, fichiers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-12 text-lg"
          />
        </div>
        
        {/* Results */}
        {query.trim() ? (
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
