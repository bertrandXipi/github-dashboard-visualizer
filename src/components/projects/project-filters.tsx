'use client'

import { Search, LayoutGrid, List, Star, HardDrive, Tag as TagIcon, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useOrganizationStore } from '@/lib/stores'
import { TagBadge } from '@/components/organization'
import type { RepositoryFilters, RepositoryStatus, ManualStatus } from '@/types'
import { MANUAL_STATUS_LABELS } from '@/types'

export interface ExtendedFilters extends RepositoryFilters {
  tagIds: string[]
  manualStatus: ManualStatus | 'all'
  favoritesOnly: boolean
  cloneStatus: 'all' | 'cloned' | 'not-cloned'
}

interface ProjectFiltersProps {
  filters: ExtendedFilters
  languages: string[]
  onFiltersChange: (filters: ExtendedFilters) => void
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
  const { tags } = useOrganizationStore()
  
  const updateFilter = <K extends keyof ExtendedFilters>(
    key: K, 
    value: ExtendedFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }
  
  const toggleTag = (tagId: string) => {
    const newTagIds = filters.tagIds.includes(tagId)
      ? filters.tagIds.filter(id => id !== tagId)
      : [...filters.tagIds, tagId]
    updateFilter('tagIds', newTagIds)
  }
  
  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      search: '',
      status: 'all',
      language: 'all',
      tagIds: [],
      manualStatus: 'all',
      favoritesOnly: false,
      cloneStatus: 'all',
    })
  }
  
  const hasActiveFilters = 
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.language !== 'all' ||
    filters.tagIds.length > 0 ||
    filters.manualStatus !== 'all' ||
    filters.favoritesOnly ||
    filters.cloneStatus !== 'all'
  
  const selectedTags = tags.filter(t => filters.tagIds.includes(t.id))
  
  return (
    <div className="space-y-3">
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
        
        {/* Manual Status filter */}
        <select
          value={filters.manualStatus}
          onChange={(e) => updateFilter('manualStatus', e.target.value as ManualStatus | 'all')}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[140px]"
        >
          <option value="all">Statut manuel</option>
          {Object.entries(MANUAL_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
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
        
        {/* Tags filter */}
        {tags.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1.5">
                <TagIcon className="h-4 w-4" />
                Tags
                {filters.tagIds.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {filters.tagIds.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {tags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={filters.tagIds.includes(tag.id)}
                  onCheckedChange={() => toggleTag(tag.id)}
                >
                  <TagBadge tag={tag} size="sm" />
                </DropdownMenuCheckboxItem>
              ))}
              {filters.tagIds.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={false}
                    onCheckedChange={() => updateFilter('tagIds', [])}
                    className="text-muted-foreground"
                  >
                    Effacer les tags
                  </DropdownMenuCheckboxItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Favorites filter */}
        <Button
          variant={filters.favoritesOnly ? 'default' : 'outline'}
          size="default"
          onClick={() => updateFilter('favoritesOnly', !filters.favoritesOnly)}
          className="gap-1.5"
        >
          <Star className={filters.favoritesOnly ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
          Favoris
        </Button>
        
        {/* Clone status filter */}
        <select
          value={filters.cloneStatus}
          onChange={(e) => updateFilter('cloneStatus', e.target.value as 'all' | 'cloned' | 'not-cloned')}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[140px]"
        >
          <option value="all">Tous (clone)</option>
          <option value="cloned">🖥️ Clonés ici</option>
          <option value="not-cloned">☁️ Non clonés</option>
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
      
      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtres actifs:</span>
          
          {selectedTags.map(tag => (
            <TagBadge 
              key={tag.id} 
              tag={tag} 
              size="sm" 
              removable 
              onRemove={() => toggleTag(tag.id)} 
            />
          ))}
          
          {filters.favoritesOnly && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-current" />
              Favoris
              <button onClick={() => updateFilter('favoritesOnly', false)}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          {filters.cloneStatus !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              <HardDrive className="h-3 w-3" />
              {filters.cloneStatus === 'cloned' ? 'Clonés' : 'Non clonés'}
              <button onClick={() => updateFilter('cloneStatus', 'all')}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 text-xs"
          >
            Effacer tout
          </Button>
        </div>
      )}
    </div>
  )
}
