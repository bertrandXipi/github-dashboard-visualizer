'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { MiniActivityGraph } from '@/components/charts/mini-activity-graph'
import { formatWeekRange } from '@/lib/utils/date-helpers'
import type { WeekActivity } from '@/types'

interface WeekCardProps {
  weekActivity: WeekActivity
  onDetailsClick: () => void
}

export function WeekCard({ weekActivity, onDetailsClick }: WeekCardProps) {
  const { 
    startDate, 
    totalCommits, 
    dailyCommits, 
    reposTouched,
    newRepos 
  } = weekActivity
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium">
              {formatWeekRange(startDate)}
            </p>
            <Badge variant="secondary" className="mt-1">
              {totalCommits} commit{totalCommits !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={onDetailsClick}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Mini activity graph */}
        <div className="mb-3">
          <MiniActivityGraph data={dailyCommits} />
        </div>
        
        {/* Projects */}
        {reposTouched.length > 0 && (
          <div className="space-y-1">
            {reposTouched.slice(0, 3).map((repo) => (
              <div 
                key={repo}
                className="flex items-center gap-2 text-xs"
              >
                <span className="truncate text-muted-foreground">{repo}</span>
                {newRepos.includes(repo) && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    nouveau
                  </Badge>
                )}
              </div>
            ))}
            {reposTouched.length > 3 && (
              <p className="text-xs text-muted-foreground">
                +{reposTouched.length - 3} autres
              </p>
            )}
          </div>
        )}
        
        {totalCommits === 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Pas d&apos;activité
          </p>
        )}
      </CardContent>
    </Card>
  )
}
