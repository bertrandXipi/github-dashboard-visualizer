'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActivityBarChart } from '@/components/charts/activity-bar-chart'
import { useActivityStore } from '@/lib/stores'
import { formatWeekRange, formatDateTime } from '@/lib/utils/date-helpers'
import { formatNumber, formatLinesChanged, formatCommitMessage } from '@/lib/utils/formatters'
import type { WeekActivity } from '@/types'

interface WeekDetailModalProps {
  week: WeekActivity | null
  open: boolean
  onClose: () => void
}

export function WeekDetailModal({ week, open, onClose }: WeekDetailModalProps) {
  const { commits } = useActivityStore()
  
  if (!week) return null
  
  // Get commits for this week
  const weekCommits = commits.filter(c => {
    const date = new Date(c.date)
    return date >= new Date(week.startDate) && date <= new Date(week.endDate)
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  // Group commits by repo
  const commitsByRepo: Record<string, typeof weekCommits> = {}
  weekCommits.forEach(commit => {
    if (!commitsByRepo[commit.repoName]) {
      commitsByRepo[commit.repoName] = []
    }
    commitsByRepo[commit.repoName].push(commit)
  })
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{formatWeekRange(week.startDate)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatNumber(week.totalCommits)}</p>
              <p className="text-xs text-muted-foreground">commits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{week.reposTouched.length}</p>
              <p className="text-xs text-muted-foreground">projets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">+{formatNumber(week.linesAdded)}</p>
              <p className="text-xs text-muted-foreground">lignes</p>
            </div>
          </div>
          
          <Separator />
          
          {/* Activity chart */}
          <div>
            <p className="text-sm font-medium mb-2">Activité quotidienne</p>
            <ActivityBarChart data={week.dailyCommits} height={100} />
          </div>
          
          <Separator />
          
          {/* Commits by repo */}
          <div>
            <p className="text-sm font-medium mb-2">Commits par projet</p>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4 pr-4">
                {Object.entries(commitsByRepo).map(([repo, repoCommits]) => (
                  <div key={repo}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{repo}</span>
                      <Badge variant="secondary" className="text-xs">
                        {repoCommits.length}
                      </Badge>
                    </div>
                    <div className="space-y-2 pl-4 border-l-2 border-muted">
                      {repoCommits.slice(0, 5).map((commit) => (
                        <div key={commit.sha} className="text-sm">
                          <p className="truncate">{formatCommitMessage(commit.message, 60)}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(commit.date, 'relative')}
                          </p>
                        </div>
                      ))}
                      {repoCommits.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{repoCommits.length - 5} autres commits
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
