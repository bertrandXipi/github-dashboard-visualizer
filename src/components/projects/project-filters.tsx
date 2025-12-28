'use client'

import { Search, LayoutGrid, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { RepositoryFilters, RepositoryStatus } from '@/types'

interface ProjectFiltersProps {
  filters: RepositoryFilters
  languages: string[]
  onFiltersChange: (filters: RepositoryFilters) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export function ProjectFilters({ 
  filters, 
  languages,
  onFiltersChange,
  viewMode,
  onViewModeChange
}: ProjectFiltersProps) {
  const updateFilter = <K extends keyof RepositoryFilters>(
    key: K, 
    value: RepositoryFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }
  
  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un projet..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9"
        />
      </div>
      
      {/* Status filter */}
      <select
        value={filters.status}
        onChange={(e) => updateFilter('status', e.target.value as RepositoryStatus | 'all')}
        className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[140px]"
      >
        <option value="all">Tous les statuts</option>
        <option value="active">🟢 Actif</option>
        <option value="warm">🟡 Tiède</option>
        <option value="cold">🔵 Froid</option>
        <option value="archived">⚫ Archivé</option>
      </select>
      
      {/* Language filter */}
      <select
        value={filters.language}
        onChange={(e) => updateFilter('language', e.target.value)}
        className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[140px]"
      >
        <option value="all">Tous les langages</option>
        {languages.map((lang) => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>
      
      {/* Sort */}
      <select
        value={filters.sortBy}
        onChange={(e) => updateFilter('sortBy', e.target.value as RepositoryFilters['sortBy'])}
        className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[150px]"
      >
        <option value="lastActivity">Dernière activité</option>
        <option value="name">Nom</option>
        <option value="stars">Stars</option>
        <option value="commits">Commits</option>
      </select>
      
      {/* View toggle */}
      <div className="flex gap-1 border rounded-md p-1 shrink-0">
        <Button
          variant={viewMode === 'list' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
