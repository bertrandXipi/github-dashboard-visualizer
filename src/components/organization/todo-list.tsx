'use client'

import { useState } from 'react'
import { Plus, ListTodo, Trash2 } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOrganizationStore } from '@/lib/stores'
import { TodoItem } from './todo-item'
import { ORGANIZATION_LIMITS } from '@/types'
import type { TodoItem as TodoItemType } from '@/types'

interface SortableTodoItemProps {
  todo: TodoItemType
  onToggle: () => void
  onDelete: () => void
}

function SortableTodoItem({ todo, onToggle, onDelete }: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  return (
    <div ref={setNodeRef} style={style}>
      <TodoItem
        todo={todo}
        onToggle={onToggle}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  )
}

interface TodoListProps {
  projectId: number
}

export function TodoList({ projectId }: TodoListProps) {
  const [newTodoText, setNewTodoText] = useState('')
  
  const { 
    todos,
    addTodo, 
    toggleTodo, 
    deleteTodo, 
    reorderTodos,
    clearCompletedTodos,
    getProjectTodos,
  } = useOrganizationStore()
  
  const projectTodos = getProjectTodos(projectId)
  const incompleteTodos = projectTodos.filter(t => !t.completed)
  const completedTodos = projectTodos.filter(t => t.completed)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  const handleAddTodo = () => {
    if (!newTodoText.trim()) return
    
    const result = addTodo(projectId, newTodoText.trim())
    if (result) {
      setNewTodoText('')
    }
  }
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = incompleteTodos.findIndex(t => t.id === active.id)
      const newIndex = incompleteTodos.findIndex(t => t.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(incompleteTodos, oldIndex, newIndex)
        const newOrder = [...reordered.map(t => t.id), ...completedTodos.map(t => t.id)]
        reorderTodos(projectId, newOrder)
      }
    }
  }
  
  const totalTodos = todos.length
  const projectTodoCount = projectTodos.length
  const canAddMore = projectTodoCount < ORGANIZATION_LIMITS.MAX_TODOS_PER_PROJECT && 
                     totalTodos < ORGANIZATION_LIMITS.MAX_TODOS_TOTAL
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <ListTodo className="h-4 w-4" />
          Tâches ({incompleteTodos.length} restante{incompleteTodos.length !== 1 ? 's' : ''})
        </Label>
        {completedTodos.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearCompletedTodos(projectId)}
            className="h-7 px-2 text-xs"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Effacer terminées ({completedTodos.length})
          </Button>
        )}
      </div>
      
      {/* Add new todo */}
      <div className="flex gap-2">
        <Input
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Ajouter une tâche..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleAddTodo()
            }
          }}
          disabled={!canAddMore}
          className="h-9"
        />
        <Button 
          onClick={handleAddTodo} 
          disabled={!newTodoText.trim() || !canAddMore}
          size="sm"
          className="h-9"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {!canAddMore && (
        <p className="text-xs text-amber-500">
          Limite atteinte ({projectTodoCount}/{ORGANIZATION_LIMITS.MAX_TODOS_PER_PROJECT} par projet)
        </p>
      )}
      
      {/* Todo list */}
      {projectTodos.length === 0 ? (
        <div className="text-center py-6 text-sm text-muted-foreground">
          Aucune tâche. Ajoutez votre première tâche ci-dessus.
        </div>
      ) : (
        <div className="space-y-2">
          {/* Incomplete todos - sortable */}
          {incompleteTodos.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={incompleteTodos.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {incompleteTodos.map((todo) => (
                    <SortableTodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={() => toggleTodo(todo.id)}
                      onDelete={() => deleteTodo(todo.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
          
          {/* Completed todos - not sortable */}
          {completedTodos.length > 0 && (
            <div className="space-y-1 pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Terminées</p>
              {completedTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => toggleTodo(todo.id)}
                  onDelete={() => deleteTodo(todo.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
