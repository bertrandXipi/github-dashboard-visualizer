'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pin, CheckSquare, Star, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOrganizationStore } from '@/lib/stores'
import { useActivityStore } from '@/lib/stores'

export function OrganizationWidgets() {
  const router = useRouter()
  const { 
    projectOrganizations, 
    todos, 
    isInitialized,
    loadFromCache 
  } = useOrganizationStore()
  const { repositories } = useActivityStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isInitialized) {
      loadFromCache()
    }
  }, [isInitialized, loadFromCache])

  if (!mounted) return null

  // Get pinned projects (max 5)
  const pinnedProjectIds = Object.entries(projectOrganizations)
    .filter(([_, org]) => org.isPinned)
    .map(([id]) => parseInt(id))
    .slice(0, 5)

  const pinnedProjects = repositories.filter(repo => 
    pinnedProjectIds.includes(repo.id)
  )

  // Get favorite projects count
  const favoriteCount = Object.values(projectOrganizations)
    .filter(org => org.isFavorite).length

  // Get incomplete TODOs count
  const incompleteTodosCount = todos.filter(t => !t.completed).length

  // Get projects with incomplete TODOs
  const projectsWithTodos = new Set(
    todos.filter(t => !t.completed).map(t => t.projectId)
  ).size

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Pinned Projects Widget */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Pin className="h-4 w-4 text-blue-500" />
            Projets épinglés
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pinnedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun projet épinglé
            </p>
          ) : (
            <div className="space-y-2">
              {pinnedProjects.map(project => {
                const org = projectOrganizations[project.id]
                const todoCount = todos.filter(
                  t => t.projectId === project.id && !t.completed
                ).length

                return (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/projects?selected=${project.id}`)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {org?.isFavorite && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">
                        {project.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {todoCount > 0 && (
                        <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded">
                          {todoCount} TODO{todoCount > 1 ? 's' : ''}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => router.push('/projects')}
          >
            Voir tous les projets
          </Button>
        </CardContent>
      </Card>

      {/* TODOs Summary Widget */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-orange-500" />
            Tâches à faire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{incompleteTodosCount}</span>
              <span className="text-sm text-muted-foreground">
                tâche{incompleteTodosCount !== 1 ? 's' : ''} en attente
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-muted-foreground">Projets concernés</span>
                <span className="font-medium">{projectsWithTodos}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Favoris</span>
                <span className="font-medium flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {favoriteCount}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => router.push('/projects')}
            >
              Gérer les tâches
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
