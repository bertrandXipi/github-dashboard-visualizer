'use client'

import { useState } from 'react'
import { Check, Plus, Tag as TagIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useOrganizationStore } from '@/lib/stores'
import { TagBadge } from './tag-badge'
import { cn } from '@/lib/utils'

interface TagSelectorProps {
  projectId: number
  className?: string
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
]

export function TagSelector({ projectId, className }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0])
  
  const { 
    tags, 
    projectOrganizations, 
    assignTag, 
    removeTag, 
    createTag 
  } = useOrganizationStore()
  
  const projectOrg = projectOrganizations[projectId]
  const assignedTagIds = projectOrg?.tagIds || []
  
  const handleToggleTag = (tagId: string) => {
    if (assignedTagIds.includes(tagId)) {
      removeTag(projectId, tagId)
    } else {
      assignTag(projectId, tagId)
    }
  }
  
  const handleCreateTag = () => {
    if (!newTagName.trim()) return
    
    const newTag = createTag(newTagName.trim(), selectedColor)
    if (newTag) {
      assignTag(projectId, newTag.id)
      setNewTagName('')
      setIsCreating(false)
    }
  }
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn('gap-1.5', className)}
        >
          <TagIcon className="h-3.5 w-3.5" />
          Tags
          {assignedTagIds.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs">
              {assignedTagIds.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {tags.length > 0 && (
          <>
            {tags.map((tag) => (
              <DropdownMenuItem
                key={tag.id}
                onClick={() => handleToggleTag(tag.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <TagBadge tag={tag} />
                {assignedTagIds.includes(tag.id) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        {isCreating ? (
          <div className="p-2 space-y-2">
            <Input
              placeholder="Nom du tag"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreateTag()
                }
                if (e.key === 'Escape') {
                  setIsCreating(false)
                  setNewTagName('')
                }
              }}
              autoFocus
              className="h-8"
            />
            <div className="flex gap-1 flex-wrap">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'h-5 w-5 rounded-full border-2 transition-transform',
                    selectedColor === color 
                      ? 'border-foreground scale-110' 
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Couleur ${color}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleCreateTag}
                disabled={!newTagName.trim()}
                className="flex-1"
              >
                Créer
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setIsCreating(false)
                  setNewTagName('')
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault()
              setIsCreating(true)
            }}
            className="cursor-pointer"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un tag
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
