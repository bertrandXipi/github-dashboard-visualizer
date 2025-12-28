/**
 * Organization Store - Zustand store for project organization data
 */

import { create } from 'zustand'
import type {
  Tag,
  ProjectOrganization,
  ProjectNote,
  TodoItem,
  MachineInfo,
  SyncQueueItem,
  ManualStatus,
} from '@/types'
import { ORGANIZATION_LIMITS } from '@/types'
import {
  getTags,
  saveTags,
  getProjectOrganizations,
  saveProjectOrganizations,
  getNotes,
  saveNotes,
  getTodos,
  saveTodos,
  getMachineInfo,
  saveMachineInfo,
  getOrCreateMachineId,
  getSyncQueue,
  saveSyncQueue,
  addToSyncQueue,
  getLastSyncAt,
  saveLastSyncAt,
  initializeDefaultTags,
} from '@/lib/storage'
import {
  validateTagName,
  validateTodoDescription,
  canPinProject,
  canAddTag,
  canAddTodoToProject,
  canAddTodoGlobally,
  createEmptyProjectOrganization,
  sortTodos,
} from '@/lib/utils/organization'

interface OrganizationState {
  // Data
  tags: Tag[]
  projectOrganizations: Record<number, ProjectOrganization>
  notes: Record<number, ProjectNote>
  todos: TodoItem[]
  machineInfo: MachineInfo | null
  
  // Sync state
  syncQueue: SyncQueueItem[]
  lastSyncAt: string | null
  isSyncing: boolean
  syncError: string | null
  
  // Initialization
  isInitialized: boolean
  
  // Tag actions
  createTag: (name: string, color: string) => Tag | null
  updateTag: (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>) => boolean
  deleteTag: (id: string) => void
  
  // Project organization actions
  assignTag: (projectId: number, tagId: string) => void
  removeTag: (projectId: number, tagId: string) => void
  toggleFavorite: (projectId: number) => void
  togglePin: (projectId: number) => boolean
  setManualStatus: (projectId: number, status: ManualStatus | null) => void
  toggleCloneStatus: (projectId: number) => void
  
  // Note actions
  saveNote: (projectId: number, content: string) => void
  deleteNote: (projectId: number) => void
  
  // TODO actions
  addTodo: (projectId: number, description: string) => TodoItem | null
  toggleTodo: (todoId: string) => void
  deleteTodo: (todoId: string) => void
  reorderTodos: (projectId: number, todoIds: string[]) => void
  clearCompletedTodos: (projectId: number) => void
  
  // Cache actions
  loadFromCache: () => void
  
  // Utilities
  getProjectOrganization: (projectId: number) => ProjectOrganization
  getProjectTodos: (projectId: number) => TodoItem[]
  getIncompleteTodoCount: (projectId: number) => number
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  // Initial state
  tags: [],
  projectOrganizations: {},
  notes: {},
  todos: [],
  machineInfo: null,
  syncQueue: [],
  lastSyncAt: null,
  isSyncing: false,
  syncError: null,
  isInitialized: false,

  // Load from cache
  loadFromCache: () => {
    const tags = initializeDefaultTags()
    const projectOrganizations = getProjectOrganizations()
    const notes = getNotes()
    const todos = getTodos()
    const machineId = getOrCreateMachineId()
    const machineInfo = getMachineInfo()
    const syncQueue = getSyncQueue()
    const lastSyncAt = getLastSyncAt()
    
    set({
      tags,
      projectOrganizations,
      notes,
      todos,
      machineInfo,
      syncQueue,
      lastSyncAt,
      isInitialized: true,
    })
  },
  
  // Tag actions
  createTag: (name: string, color: string) => {
    const { tags } = get()
    
    // Validate
    const error = validateTagName(name, tags)
    if (error) return null
    
    // Check limit
    if (!canAddTag(tags)) return null
    
    const now = new Date().toISOString()
    const newTag: Tag = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      createdAt: now,
      updatedAt: now,
    }
    
    const updatedTags = [...tags, newTag]
    saveTags(updatedTags)
    addToSyncQueue({ type: 'tag', action: 'create', data: newTag })
    
    set({ tags: updatedTags })
    return newTag
  },
  
  updateTag: (id: string, updates: Partial<Pick<Tag, 'name' | 'color'>>) => {
    const { tags } = get()
    const tagIndex = tags.findIndex(t => t.id === id)
    if (tagIndex === -1) return false
    
    // Validate name if updating
    if (updates.name) {
      const otherTags = tags.filter(t => t.id !== id)
      const error = validateTagName(updates.name, otherTags)
      if (error) return false
    }
    
    const updatedTag: Tag = {
      ...tags[tagIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    const updatedTags = [...tags]
    updatedTags[tagIndex] = updatedTag
    
    saveTags(updatedTags)
    addToSyncQueue({ type: 'tag', action: 'update', data: updatedTag })
    
    set({ tags: updatedTags })
    return true
  },
  
  deleteTag: (id: string) => {
    const { tags, projectOrganizations } = get()
    
    // Remove tag from list
    const updatedTags = tags.filter(t => t.id !== id)
    
    // Remove tag from all projects
    const updatedOrgs = { ...projectOrganizations }
    Object.keys(updatedOrgs).forEach(key => {
      const projectId = parseInt(key)
      const org = updatedOrgs[projectId]
      if (org.tagIds.includes(id)) {
        updatedOrgs[projectId] = {
          ...org,
          tagIds: org.tagIds.filter(tagId => tagId !== id),
        }
      }
    })
    
    saveTags(updatedTags)
    saveProjectOrganizations(updatedOrgs)
    addToSyncQueue({ type: 'tag', action: 'delete', data: { id } })
    
    set({ tags: updatedTags, projectOrganizations: updatedOrgs })
  },
  
  // Project organization actions
  assignTag: (projectId: number, tagId: string) => {
    const { projectOrganizations, tags } = get()
    
    // Verify tag exists
    if (!tags.some(t => t.id === tagId)) return
    
    const org = projectOrganizations[projectId] || createEmptyProjectOrganization(projectId)
    
    // Don't add if already assigned
    if (org.tagIds.includes(tagId)) return
    
    const updatedOrg: ProjectOrganization = {
      ...org,
      tagIds: [...org.tagIds, tagId],
    }
    
    const updatedOrgs = { ...projectOrganizations, [projectId]: updatedOrg }
    saveProjectOrganizations(updatedOrgs)
    addToSyncQueue({ type: 'project-org', action: 'update', data: updatedOrg })
    
    set({ projectOrganizations: updatedOrgs })
  },
  
  removeTag: (projectId: number, tagId: string) => {
    const { projectOrganizations } = get()
    const org = projectOrganizations[projectId]
    if (!org) return
    
    const updatedOrg: ProjectOrganization = {
      ...org,
      tagIds: org.tagIds.filter(id => id !== tagId),
    }
    
    const updatedOrgs = { ...projectOrganizations, [projectId]: updatedOrg }
    saveProjectOrganizations(updatedOrgs)
    addToSyncQueue({ type: 'project-org', action: 'update', data: updatedOrg })
    
    set({ projectOrganizations: updatedOrgs })
  },
  
  toggleFavorite: (projectId: number) => {
    const { projectOrganizations } = get()
    const org = projectOrganizations[projectId] || createEmptyProjectOrganization(projectId)
    
    const updatedOrg: ProjectOrganization = {
      ...org,
      isFavorite: !org.isFavorite,
    }
    
    const updatedOrgs = { ...projectOrganizations, [projectId]: updatedOrg }
    saveProjectOrganizations(updatedOrgs)
    addToSyncQueue({ type: 'project-org', action: 'update', data: updatedOrg })
    
    set({ projectOrganizations: updatedOrgs })
  },
  
  togglePin: (projectId: number) => {
    const { projectOrganizations } = get()
    const org = projectOrganizations[projectId] || createEmptyProjectOrganization(projectId)
    
    // If trying to pin, check limit
    if (!org.isPinned && !canPinProject(projectOrganizations)) {
      return false
    }
    
    const updatedOrg: ProjectOrganization = {
      ...org,
      isPinned: !org.isPinned,
    }
    
    const updatedOrgs = { ...projectOrganizations, [projectId]: updatedOrg }
    saveProjectOrganizations(updatedOrgs)
    addToSyncQueue({ type: 'project-org', action: 'update', data: updatedOrg })
    
    set({ projectOrganizations: updatedOrgs })
    return true
  },
  
  setManualStatus: (projectId: number, status: ManualStatus | null) => {
    const { projectOrganizations } = get()
    const org = projectOrganizations[projectId] || createEmptyProjectOrganization(projectId)
    
    const updatedOrg: ProjectOrganization = {
      ...org,
      manualStatus: status,
      manualStatusDate: status ? new Date().toISOString() : null,
    }
    
    const updatedOrgs = { ...projectOrganizations, [projectId]: updatedOrg }
    saveProjectOrganizations(updatedOrgs)
    addToSyncQueue({ type: 'project-org', action: 'update', data: updatedOrg })
    
    set({ projectOrganizations: updatedOrgs })
  },
  
  toggleCloneStatus: (projectId: number) => {
    const { projectOrganizations, machineInfo } = get()
    if (!machineInfo) return
    
    const org = projectOrganizations[projectId] || createEmptyProjectOrganization(projectId)
    const isCloned = org.clonedOnMachines.includes(machineInfo.id)
    
    const updatedOrg: ProjectOrganization = {
      ...org,
      clonedOnMachines: isCloned
        ? org.clonedOnMachines.filter(id => id !== machineInfo.id)
        : [...org.clonedOnMachines, machineInfo.id],
    }
    
    const updatedOrgs = { ...projectOrganizations, [projectId]: updatedOrg }
    saveProjectOrganizations(updatedOrgs)
    addToSyncQueue({ type: 'project-org', action: 'update', data: updatedOrg })
    
    set({ projectOrganizations: updatedOrgs })
  },

  // Note actions
  saveNote: (projectId: number, content: string) => {
    const { notes } = get()
    
    // Truncate if too long
    const truncatedContent = content.slice(0, ORGANIZATION_LIMITS.MAX_NOTE_LENGTH)
    
    const now = new Date().toISOString()
    const existingNote = notes[projectId]
    
    const updatedNote: ProjectNote = {
      projectId,
      content: truncatedContent,
      createdAt: existingNote?.createdAt || now,
      updatedAt: now,
    }
    
    const updatedNotes = { ...notes, [projectId]: updatedNote }
    saveNotes(updatedNotes)
    addToSyncQueue({ type: 'note', action: existingNote ? 'update' : 'create', data: updatedNote })
    
    set({ notes: updatedNotes })
  },
  
  deleteNote: (projectId: number) => {
    const { notes } = get()
    
    if (!notes[projectId]) return
    
    const updatedNotes = { ...notes }
    delete updatedNotes[projectId]
    
    saveNotes(updatedNotes)
    addToSyncQueue({ type: 'note', action: 'delete', data: { projectId } })
    
    set({ notes: updatedNotes })
  },
  
  // TODO actions
  addTodo: (projectId: number, description: string) => {
    const { todos } = get()
    
    // Validate
    const error = validateTodoDescription(description)
    if (error) return null
    
    // Check limits
    if (!canAddTodoToProject(todos, projectId)) return null
    if (!canAddTodoGlobally(todos)) return null
    
    // Get max order for this project
    const projectTodos = todos.filter(t => t.projectId === projectId)
    const maxOrder = projectTodos.length > 0
      ? Math.max(...projectTodos.map(t => t.order))
      : -1
    
    const now = new Date().toISOString()
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      projectId,
      description: description.trim(),
      completed: false,
      order: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    }
    
    const updatedTodos = [...todos, newTodo]
    saveTodos(updatedTodos)
    addToSyncQueue({ type: 'todo', action: 'create', data: newTodo })
    
    set({ todos: updatedTodos })
    return newTodo
  },
  
  toggleTodo: (todoId: string) => {
    const { todos } = get()
    const todoIndex = todos.findIndex(t => t.id === todoId)
    if (todoIndex === -1) return
    
    const updatedTodo: TodoItem = {
      ...todos[todoIndex],
      completed: !todos[todoIndex].completed,
      updatedAt: new Date().toISOString(),
    }
    
    const updatedTodos = [...todos]
    updatedTodos[todoIndex] = updatedTodo
    
    saveTodos(updatedTodos)
    addToSyncQueue({ type: 'todo', action: 'update', data: updatedTodo })
    
    set({ todos: updatedTodos })
  },
  
  deleteTodo: (todoId: string) => {
    const { todos } = get()
    
    const updatedTodos = todos.filter(t => t.id !== todoId)
    
    saveTodos(updatedTodos)
    addToSyncQueue({ type: 'todo', action: 'delete', data: { id: todoId } })
    
    set({ todos: updatedTodos })
  },
  
  reorderTodos: (projectId: number, todoIds: string[]) => {
    const { todos } = get()
    
    // Update order for each todo
    const updatedTodos = todos.map(todo => {
      if (todo.projectId !== projectId) return todo
      
      const newOrder = todoIds.indexOf(todo.id)
      if (newOrder === -1) return todo
      
      return {
        ...todo,
        order: newOrder,
        updatedAt: new Date().toISOString(),
      }
    })
    
    saveTodos(updatedTodos)
    // Sync all reordered todos
    const reorderedTodos = updatedTodos.filter(t => t.projectId === projectId)
    reorderedTodos.forEach(todo => {
      addToSyncQueue({ type: 'todo', action: 'update', data: todo })
    })
    
    set({ todos: updatedTodos })
  },
  
  clearCompletedTodos: (projectId: number) => {
    const { todos } = get()
    
    const completedTodos = todos.filter(t => t.projectId === projectId && t.completed)
    const updatedTodos = todos.filter(t => !(t.projectId === projectId && t.completed))
    
    saveTodos(updatedTodos)
    completedTodos.forEach(todo => {
      addToSyncQueue({ type: 'todo', action: 'delete', data: { id: todo.id } })
    })
    
    set({ todos: updatedTodos })
  },
  
  // Utilities
  getProjectOrganization: (projectId: number) => {
    const { projectOrganizations } = get()
    return projectOrganizations[projectId] || createEmptyProjectOrganization(projectId)
  },
  
  getProjectTodos: (projectId: number) => {
    const { todos } = get()
    const projectTodos = todos.filter(t => t.projectId === projectId)
    return sortTodos(projectTodos)
  },
  
  getIncompleteTodoCount: (projectId: number) => {
    const { todos } = get()
    return todos.filter(t => t.projectId === projectId && !t.completed).length
  },
}))
