'use client'

import { GitCommit, FolderGit2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useActivityStore } from '@/lib/stores'
import { getTodayCommits, getTodayProjects } from '@/lib/utils/calculations'
import { formatTime } from '@/lib/utils/date-helpers'
import { formatCommitMessage } from '@/lib/utils/formatters'

export function TodayCard() {
  const { commits } = useActivityStore()
  
  const todayCommits = getTodayCommits(commits)
  const todayProjects = getTodayProjects(commits)
  const lastCommit = todayCommits[0]
  
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span>Aujourd&apos;hui</span>
          <Badge variant="secondary" className="ml-auto">
            {todayCommits.length} commit{todayCommits.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {todayCommits.length > 0 ? (
          <>
            {/* Projects touched */}
            <div className="flex items-start gap-2">
              <FolderGit2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Projets actifs</p>
                <div className="flex flex-wrap gap-1">
                  {todayProjects.map((project) => (
                    <Badge key={project} variant="outline" className="text-xs">
                      {project}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Last commit */}
            {lastCommit && (
              <div className="flex items-start gap-2">
                <GitCommit className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Dernier commit</p>
                  <p className="text-sm truncate">
                    {formatCommitMessage(lastCommit.message, 60)}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(lastCommit.date)}</span>
                    <span>•</span>
                    <span>{lastCommit.repoName}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Pas encore de commit aujourd&apos;hui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Prêt à coder quelque chose ? 🚀
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
