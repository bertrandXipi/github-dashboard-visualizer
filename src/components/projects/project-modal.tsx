'use client'

import { useMemo, useState } from 'react'
import { 
  ExternalLink, 
  GitCommit, 
  Star, 
  GitFork,
  Calendar,
  BarChart3,
  Clock
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, isWithinInterval, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActivityBarChart, HeatmapCalendar } from '@/components/charts'
import { useActivityStore } from '@/lib/stores'
import { formatDate } from '@/lib/utils/date-helpers'
import { formatCommitMessage, formatNumber } from '@/lib/utils/formatters'
import type { Repository, Commit } from '@/types'

interface ProjectModalProps {
  repository: Repository | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectModal({ repository, open, onOpenChange }: ProjectModalProps) {
  const { commits } = useActivityStore()
  const [activeTab, setActiveTab] = useState('activity')
  
  const repoCommits = useMemo(() => {
    if (!repository) return []
    return commits
      .filter(c => c.repoName === repository.name)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [commits, repository])
  
  // Group commits by week
  const commitsByWeek = useMemo(() => {
    const groups: { weekStart: Date; weekEnd: Date; commits: Commit[] }[] = []
    
    repoCommits.forEach(commit => {
      const commitDate = new Date(commit.date)
      const weekStart = startOfWeek(commitDate, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(commitDate, { weekStartsOn: 1 })
      
      const existingGroup = groups.find(g => 
        isWithinInterval(commitDate, { start: g.weekStart, end: g.weekEnd })
      )
      
      if (existingGroup) {
        existingGroup.commits.push(commit)
      } else {
        groups.push({ weekStart, weekEnd, commits: [commit] })
      }
    })
    
    return groups.sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime())
  }, [repoCommits])
  
  // Daily activity for chart
  const dailyActivity = useMemo(() => {
    const counts = new Array(7).fill(0)
    
    const threeMonthsAgo = subMonths(new Date(), 3)
    repoCommits
      .filter(c => new Date(c.date) >= threeMonthsAgo)
      .forEach(commit => {
        const day = new Date(commit.date).getDay()
        const adjustedDay = day === 0 ? 6 : day - 1
        counts[adjustedDay]++
      })
    
    return counts
  }, [repoCommits])
  
  // Stats
  const stats = useMemo(() => {
    if (!repository) return null
    
    const threeMonthsAgo = subMonths(new Date(), 3)
    const recentCommits = repoCommits.filter(c => new Date(c.date) >= threeMonthsAgo)
    
    const filesChanged = new Set<string>()
    recentCommits.forEach(c => c.filesChanged.forEach(f => filesChanged.add(f)))
    
    return {
      totalCommits: repoCommits.length,
      recentCommits: recentCommits.length,
      filesChanged: filesChanged.size,
      avgPerWeek: Math.round(recentCommits.length / 12),
    }
  }, [repository, repoCommits])
  
  if (!repository) return null
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{repository.name}</DialogTitle>
              {repository.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {repository.description}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(repository.htmlUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mt-2">
            {repository.language && (
              <Badge variant="secondary">{repository.language}</Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              {formatNumber(repository.stars)}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <GitFork className="h-4 w-4" />
              {formatNumber(repository.forks)}
            </div>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="activity">Activité</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {/* Activity chart */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium mb-3">Activité par jour</h3>
                    <ActivityBarChart data={dailyActivity} />
                  </CardContent>
                </Card>
                
                {/* Recent commits */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Commits récents</h3>
                  {repoCommits.slice(0, 20).map(commit => (
                    <Card key={commit.sha} className="bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <GitCommit className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">
                              {formatCommitMessage(commit.message, 60)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(commit.date, 'relative')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => window.open(commit.url, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="stats" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px]">
              <div className="grid gap-4 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <GitCommit className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{stats?.totalCommits}</p>
                          <p className="text-sm text-muted-foreground">Total commits</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{stats?.avgPerWeek}</p>
                          <p className="text-sm text-muted-foreground">Commits/semaine</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{stats?.recentCommits}</p>
                          <p className="text-sm text-muted-foreground">3 derniers mois</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{stats?.filesChanged}</p>
                          <p className="text-sm text-muted-foreground">Fichiers modifiés</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="timeline" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {/* Heatmap */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium mb-3">Calendrier d&apos;activité</h3>
                    <HeatmapCalendar commits={repoCommits} months={3} />
                  </CardContent>
                </Card>
                
                {/* Commits by week */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Par semaine</h3>
                  {commitsByWeek.slice(0, 12).map((week, i) => (
                    <Card key={i} className="bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">
                            {format(week.weekStart, 'd MMM', { locale: fr })} - {format(week.weekEnd, 'd MMM yyyy', { locale: fr })}
                          </p>
                          <Badge variant="secondary">
                            {week.commits.length} commit{week.commits.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {week.commits.slice(0, 3).map(commit => (
                            <p key={commit.sha} className="text-xs text-muted-foreground truncate">
                              • {formatCommitMessage(commit.message, 50)}
                            </p>
                          ))}
                          {week.commits.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{week.commits.length - 3} autres
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
