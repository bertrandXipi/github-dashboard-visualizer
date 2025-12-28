'use client'

import { 
  FolderGit2, 
  GitCommit, 
  Flame, 
  Code2,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HeatmapCalendar } from '@/components/charts'
import { useActivityStore } from '@/lib/stores'
import { formatNumber } from '@/lib/utils/formatters'

export function StatsPanel() {
  const { globalStats, repositories, commits } = useActivityStore()
  
  const stats = [
    {
      label: 'Total projets',
      value: globalStats?.totalProjects ?? repositories.length,
      icon: FolderGit2,
    },
    {
      label: 'Total commits',
      value: globalStats?.totalCommits ?? 0,
      icon: GitCommit,
    },
    {
      label: 'Streak actuel',
      value: globalStats?.currentStreak ?? 0,
      icon: Flame,
      suffix: 'jours',
    },
    {
      label: 'Langage favori',
      value: globalStats?.mostUsedLanguage ?? '-',
      icon: Code2,
      isText: true,
    },
    {
      label: 'Projet le plus actif',
      value: globalStats?.mostActiveProject ?? '-',
      icon: TrendingUp,
      isText: true,
    },
  ]
  
  return (
    <aside className="hidden xl:block w-72 border-l bg-card h-screen sticky top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-4">
          Statistiques globales
        </h2>
        
        <div className="space-y-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-muted/50">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-semibold truncate">
                      {stat.isText 
                        ? stat.value 
                        : formatNumber(stat.value as number)}
                      {stat.suffix && ` ${stat.suffix}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Heatmap Calendar */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            Activité récente
          </h3>
          <Card className="bg-muted/50">
            <CardContent className="p-3">
              <HeatmapCalendar commits={commits} months={3} />
            </CardContent>
          </Card>
        </div>
      </div>
    </aside>
  )
}
