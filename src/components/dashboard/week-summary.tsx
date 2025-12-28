'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useActivityStore } from '@/lib/stores'
import { ActivityBarChart } from '@/components/charts/activity-bar-chart'
import { getWeekId } from '@/lib/utils/calculations'
import { getCurrentWeekStart } from '@/lib/utils/date-helpers'
import { formatNumber } from '@/lib/utils/formatters'

export function WeekSummary() {
  const { weeksActivity, commits } = useActivityStore()
  
  const currentWeekId = getWeekId(getCurrentWeekStart())
  const currentWeek = weeksActivity[currentWeekId]
  
  // Get top 3 projects this week
  const projectCounts: Record<string, number> = {}
  if (currentWeek) {
    currentWeek.reposTouched.forEach(repo => {
      const repoCommits = commits.filter(c => 
        c.repoName === repo && 
        new Date(c.date) >= new Date(currentWeek.startDate) &&
        new Date(c.date) <= new Date(currentWeek.endDate)
      )
      projectCounts[repo] = repoCommits.length
    })
  }
  
  const topProjects = Object.entries(projectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Cette semaine</span>
          <Badge variant="outline">
            {currentWeek?.totalCommits ?? 0} commits
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bar chart */}
        <ActivityBarChart 
          data={currentWeek?.dailyCommits ?? [0, 0, 0, 0, 0, 0, 0]} 
        />
        
        {/* Top projects */}
        {topProjects.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Top projets</p>
            <div className="space-y-1">
              {topProjects.map(([project, count], index) => (
                <div 
                  key={project}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span className="truncate">{project}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {formatNumber(count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(!currentWeek || currentWeek.totalCommits === 0) && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Pas encore d&apos;activité cette semaine
          </p>
        )}
      </CardContent>
    </Card>
  )
}
