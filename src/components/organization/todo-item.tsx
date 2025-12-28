'use client'

import { GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TodoItem as TodoItemType } from '@/types'

interface TodoItemProps {
  todo: TodoItemType
  onToggle: () => void
  onDelete: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  isDragging?: boolean
}

export function TodoItem({ 
  todo, 
  onToggle, 
  onDelete,
  dragHandleProps,
  isDragging = false
}: TodoItemProps) {
  return (
    <div 
      className={cn(
        'flex items-center gap-2 p-2 rounded-md border bg-card group',
        isDragging && 'opacity-50 shadow-lg',
        todo.completed && 'bg-muted/50'
      )}
    >
      {dragHandleProps && (
        <div 
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      
      <label className="flex items-center gap-2 flex-1 cursor-pointer">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={onToggle}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span 
          className={cn(
            'text-sm flex-1',
            todo.completed && 'line-through text-muted-foreground'
          )}
        >
          {todo.description}
        </span>
      </label>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
        aria-label="Supprimer la tâche"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
