'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RepositoryFilters, RepositoryStatus } from '@/types'

interface ProjectFiltersProps {
  filters: RepositoryFilters
  languages: string[]
  onFiltersChange: (filters: RepositoryFilters) => void
}

export function ProjectFilters({ 
  filters, 
  languages,
  onFiltersChange 
}: ProjectFiltersProps) {
  const updateFilter = <K extends keyof RepositoryFilters>(
    key: K, 
    value: RepositoryFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }
  
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
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
        className="h-10 px-3 rounded-md border border-input bg-background text-sm"
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
        className="h-10 px-3 rounded-md border border-input bg-background text-sm"
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
        className="h-10 px-3 rounded-md border border-input bg-background text-sm"
      >
        <option value="lastActivity">Dernière activité</option>
        <option value="name">Nom</option>
        <option value="stars">Stars</option>
        <option value="commits">Commits</option>
      </select>
    </div>
  )
}
