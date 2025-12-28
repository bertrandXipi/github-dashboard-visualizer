'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useOrganizationStore } from '@/lib/stores'
import { TagBadge } from './tag-badge'
import { cn } from '@/lib/utils'
import type { Tag } from '@/types'
import { ORGANIZATION_LIMITS } from '@/types'

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
]

interface TagFormProps {
  initialName?: string
  initialColor?: string
  onSubmit: (name: string, color: string) => void
  onCancel: () => void
  submitLabel: string
}

function TagForm({ 
  initialName = '', 
  initialColor = DEFAULT_COLORS[0], 
  onSubmit, 
  onCancel,
  submitLabel 
}: TagFormProps) {
  const [name, setName] = useState(initialName)
  const [color, setColor] = useState(initialColor)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name.trim(), color)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tag-name">Nom du tag</Label>
        <Input
          id="tag-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: client, perso, urgent..."
          autoFocus
        />
      </div>
      
      <div className="space-y-2">
        <Label>Couleur</Label>
        <div className="flex gap-2 flex-wrap">
          {DEFAULT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-all',
                color === c 
                  ? 'border-foreground scale-110 ring-2 ring-offset-2 ring-foreground/20' 
                  : 'border-transparent hover:scale-105'
              )}
              style={{ backgroundColor: c }}
              aria-label={`Couleur ${c}`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2 pt-2">
        <div className="text-sm text-muted-foreground">Aperçu:</div>
        <TagBadge 
          tag={{ id: 'preview', name: name || 'Tag', color, createdAt: '', updatedAt: '' }} 
          size="md"
        />
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={!name.trim()}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function TagManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null)
  
  const { tags, createTag, updateTag, deleteTag } = useOrganizationStore()
  
  const handleCreate = (name: string, color: string) => {
    const result = createTag(name, color)
    if (result) {
      setIsCreateOpen(false)
    }
  }
  
  const handleUpdate = (name: string, color: string) => {
    if (editingTag) {
      updateTag(editingTag.id, { name, color })
      setEditingTag(null)
    }
  }
  
  const handleDelete = () => {
    if (deletingTag) {
      deleteTag(deletingTag.id)
      setDeletingTag(null)
    }
  }
  
  const canAddMore = tags.length < ORGANIZATION_LIMITS.MAX_TAGS
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Tags</h3>
          <p className="text-sm text-muted-foreground">
            Gérez vos tags pour organiser vos projets ({tags.length}/{ORGANIZATION_LIMITS.MAX_TAGS})
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)} 
          disabled={!canAddMore}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nouveau tag
        </Button>
      </div>
      
      {tags.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Aucun tag créé. Créez votre premier tag pour organiser vos projets.
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div 
              key={tag.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <TagBadge tag={tag} size="md" />
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingTag(tag)}
                  aria-label={`Modifier ${tag.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletingTag(tag)}
                  aria-label={`Supprimer ${tag.name}`}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un tag</DialogTitle>
            <DialogDescription>
              Créez un nouveau tag pour catégoriser vos projets.
            </DialogDescription>
          </DialogHeader>
          <TagForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            submitLabel="Créer"
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog open={!!editingTag} onOpenChange={(open) => !open && setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le tag</DialogTitle>
            <DialogDescription>
              Modifiez le nom ou la couleur du tag.
            </DialogDescription>
          </DialogHeader>
          {editingTag && (
            <TagForm
              initialName={editingTag.name}
              initialColor={editingTag.color}
              onSubmit={handleUpdate}
              onCancel={() => setEditingTag(null)}
              submitLabel="Enregistrer"
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingTag} onOpenChange={(open) => !open && setDeletingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le tag</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le tag "{deletingTag?.name}" ? 
              Il sera retiré de tous les projets associés.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTag(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
