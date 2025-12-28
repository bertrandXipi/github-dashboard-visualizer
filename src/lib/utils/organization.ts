/**
 * Organization Utilities - Sorting, filtering, and validation functions
 */

import type { 
  Repository, 
  ProjectOrganization, 
  TodoItem, 
  ManualStatus,
  Tag,
} from '@/types'
import { ORGANIZATION_LIMITS } from '@/types'

/**
 * Sort projects by organization: pinned first, then favorites, then others
 */
export function sortProjectsByOrganization(
  projects: Repository[],
  organizations: Record<number, ProjectOrganization>
): Repository[] {
  return [...projects].sort((a, b) => {
    const orgA = organizations[a.id] || { isPinned: false, isFavorite: false }
    const orgB = organizations[b.id] || { isPinned: false, isFavorite: false }
    
    // Pinned first
    if (orgA.isPinned && !orgB.isPinned) return -1
    if (!orgA.isPinned && orgB.isPinned) return 1
    
    // Then favorites
    if (orgA.isFavorite && !orgB.isFavorite) return -1
    if (!orgA.isFavorite && orgB.isFavorite) return 1
    
    // Keep original order for others
    return 0
  })
}

/**
 * Filter projects by tags (any match)
 */
export function filterProjectsByTags(
  projects: Repository[],
  organizations: Record<number, ProjectOrganization>,
  tagIds: string[]
): Repository[] {
  if (tagIds.length === 0) return projects
  return projects.filter(p => {
    const org = organizations[p.id]
    if (!org) return false
    return tagIds.some(tagId => org.tagIds.includes(tagId))
  })
}

/**
 * Filter projects by manual status
 */
export function filterProjectsByStatus(
  projects: Repository[],
  organizations: Record<number, ProjectOrganization>,
  status: ManualStatus
): Repository[] {
  return projects.filter(p => {
    const org = organizations[p.id]
    return org?.manualStatus === status
  })
}

/**
 * Filter projects by clone status on current machine
 */
export function filterProjectsByCloneStatus(
  projects: Repository[],
  organizations: Record<number, ProjectOrganization>,
  machineId: string,
  isCloned: boolean
): Repository[] {
  return projects.filter(p => {
    const org = organizations[p.id]
    const cloned = org?.clonedOnMachines.includes(machineId) ?? false
    return cloned === isCloned
  })
}

/**
 * Filter projects by favorite status
 */
export function filterProjectsByFavorite(
  projects: Repository[],
  organizations: Record<number, ProjectOrganization>,
  isFavorite: boolean
): Repository[] {
  return projects.filter(p => {
    const org = organizations[p.id]
    return (org?.isFavorite ?? false) === isFavorite
  })
}

/**
 * Sort TODOs: incomplete first (by order), then completed (by order)
 */
export function sortTodos(todos: TodoItem[]): TodoItem[] {
  const incomplete = todos.filter(t => !t.completed).sort((a, b) => a.order - b.order)
  const completed = todos.filter(t => t.completed).sort((a, b) => a.order - b.order)
  return [...incomplete, ...completed]
}

/**
 * Get effective status (manual if set, otherwise automatic)
 */
export function getEffectiveStatus(
  project: Repository,
  organization: ProjectOrganization | undefined
): { status: string; isManual: boolean } {
  if (organization?.manualStatus) {
    return { status: organization.manualStatus, isManual: true }
  }
  return { status: project.status, isManual: false }
}

/**
 * Validate tag name
 * Returns error message or null if valid
 */
export function validateTagName(name: string, existingTags: Tag[]): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Le nom du tag ne peut pas être vide'
  if (existingTags.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
    return 'Un tag avec ce nom existe déjà'
  }
  return null
}

/**
 * Validate TODO description
 * Returns error message or null if valid
 */
export function validateTodoDescription(description: string): string | null {
  const trimmed = description.trim()
  if (!trimmed) return 'La description ne peut pas être vide'
  return null
}

/**
 * Check if can add more pinned projects
 */
export function canPinProject(
  organizations: Record<number, ProjectOrganization>
): boolean {
  const pinnedCount = Object.values(organizations).filter(o => o.isPinned).length
  return pinnedCount < ORGANIZATION_LIMITS.MAX_PINNED_PROJECTS
}

/**
 * Check if can add more tags
 */
export function canAddTag(tags: Tag[]): boolean {
  return tags.length < ORGANIZATION_LIMITS.MAX_TAGS
}

/**
 * Check if can add more TODOs to a project
 */
export function canAddTodoToProject(todos: TodoItem[], projectId: number): boolean {
  const projectTodos = todos.filter(t => t.projectId === projectId)
  return projectTodos.length < ORGANIZATION_LIMITS.MAX_TODOS_PER_PROJECT
}

/**
 * Check if can add more TODOs globally
 */
export function canAddTodoGlobally(todos: TodoItem[]): boolean {
  return todos.length < ORGANIZATION_LIMITS.MAX_TODOS_TOTAL
}

/**
 * Generate unique machine ID
 */
export function generateMachineId(): string {
  return crypto.randomUUID()
}

/**
 * Get incomplete TODO count for a project
 */
export function getIncompleteTodoCount(todos: TodoItem[], projectId: number): number {
  return todos.filter(t => t.projectId === projectId && !t.completed).length
}

/**
 * Get total incomplete TODO count
 */
export function getTotalIncompleteTodoCount(todos: TodoItem[]): number {
  return todos.filter(t => !t.completed).length
}

/**
 * Get TODOs for a specific project
 */
export function getProjectTodos(todos: TodoItem[], projectId: number): TodoItem[] {
  return todos.filter(t => t.projectId === projectId)
}

/**
 * Get pinned projects
 */
export function getPinnedProjects(
  projects: Repository[],
  organizations: Record<number, ProjectOrganization>
): Repository[] {
  return projects.filter(p => organizations[p.id]?.isPinned)
}

/**
 * Create empty project organization
 */
export function createEmptyProjectOrganization(projectId: number): ProjectOrganization {
  return {
    projectId,
    tagIds: [],
    isFavorite: false,
    isPinned: false,
    manualStatus: null,
    manualStatusDate: null,
    clonedOnMachines: [],
  }
}
