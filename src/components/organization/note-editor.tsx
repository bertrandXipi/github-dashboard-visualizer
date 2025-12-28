'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useOrganizationStore } from '@/lib/stores'
import { ORGANIZATION_LIMITS } from '@/types'
import { formatDateTime } from '@/lib/utils/date-helpers'

interface NoteEditorProps {
  projectId: number
}

export function NoteEditor({ projectId }: NoteEditorProps) {
  const { notes, saveNote, deleteNote } = useOrganizationStore()
  const note = notes[projectId]
  
  const [content, setContent] = useState(note?.content || '')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(note?.updatedAt || null)
  
  // Sync content when note changes externally
  useEffect(() => {
    if (note?.content !== undefined && note.content !== content) {
      setContent(note.content)
      setLastSaved(note.updatedAt)
    }
  }, [note?.content, note?.updatedAt])
  
  // Auto-save with debounce
  const debouncedSave = useCallback((value: string) => {
    const timeoutId = setTimeout(() => {
      if (value.trim()) {
        saveNote(projectId, value)
        setLastSaved(new Date().toISOString())
      }
      setIsSaving(false)
    }, 2000)
    
    return () => clearTimeout(timeoutId)
  }, [projectId, saveNote])
  
  useEffect(() => {
    if (content !== (note?.content || '')) {
      setIsSaving(true)
      const cleanup = debouncedSave(content)
      return cleanup
    }
  }, [content, note?.content, debouncedSave])
  
  const handleDelete = () => {
    deleteNote(projectId)
    setContent('')
    setLastSaved(null)
  }
  
  const charCount = content.length
  const isNearLimit = charCount > ORGANIZATION_LIMITS.MAX_NOTE_LENGTH * 0.9
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="note-editor" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Notes
        </Label>
        {note && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive h-7 px-2"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Supprimer
          </Button>
        )}
      </div>
      
      <textarea
        id="note-editor"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ajoutez des notes sur ce projet... (Markdown supporté)"
        className="w-full min-h-[150px] p-3 rounded-md border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
        maxLength={ORGANIZATION_LIMITS.MAX_NOTE_LENGTH}
      />
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-amber-500">Enregistrement...</span>
          )}
          {!isSaving && lastSaved && (
            <span>Dernière modification: {formatDateTime(lastSaved)}</span>
          )}
        </div>
        <span className={isNearLimit ? 'text-amber-500' : ''}>
          {charCount.toLocaleString()} / {ORGANIZATION_LIMITS.MAX_NOTE_LENGTH.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
