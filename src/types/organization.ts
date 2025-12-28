/**
 * Organization types for project categorization and productivity features
 */

/**
 * Custom tag for categorizing projects
 */
export interface Tag {
  id: string           // UUID
  name: string         // Display name (unique, non-empty)
  color: string        // Hex color code
  createdAt: string    // ISO date
  updatedAt: string    // ISO date
}

/**
 * Default tags provided on first use
 */
export const DEFAULT_TAGS: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'client', color: '#3B82F6' },      // Blue
  { name: 'perso', color: '#10B981' },       // Green
  { name: 'side-project', color: '#8B5CF6' }, // Purple
  { name: 'à finir', color: '#F59E0B' },     // Amber
]

/**
 * Manual status options for projects
 */
export type ManualStatus = 'en-cours' | 'en-pause' | 'termine' | 'abandonne'

export const MANUAL_STATUS_LABELS: Record<ManualStatus, string> = {
  'en-cours': 'En cours',
  'en-pause': 'En pause',
  'termine': 'Terminé',
  'abandonne': 'Abandonné',
}

export const MANUAL_STATUS_COLORS: Record<ManualStatus, string> = {
  'en-cours': '#22C55E',   // Green
  'en-pause': '#F59E0B',   // Amber
  'termine': '#3B82F6',    // Blue
  'abandonne': '#6B7280',  // Gray
}

/**
 * TODO item for a project
 */
export interface TodoItem {
  id: string           // UUID
  projectId: number    // Repository ID
  description: string  // Non-empty text
  completed: boolean
  order: number        // For drag & drop reordering
  createdAt: string    // ISO date
  updatedAt: string    // ISO date
}

/**
 * Note attached to a project
 */
export interface ProjectNote {
  projectId: number    // Repository ID
  content: string      // Markdown content (max 10,000 chars)
  createdAt: string    // ISO date
  updatedAt: string    // ISO date
}

/**
 * Organization metadata for a project
 */
export interface ProjectOrganization {
  projectId: number
  tagIds: string[]           // Assigned tag IDs
  isFavorite: boolean
  isPinned: boolean
  manualStatus: ManualStatus | null
  manualStatusDate: string | null  // When status was set
  clonedOnMachines: string[]       // Machine IDs where cloned
}

/**
 * Machine identification
 */
export interface MachineInfo {
  id: string           // UUID, unique per browser
  name: string         // User-friendly name (optional)
  createdAt: string    // ISO date
  lastSeenAt: string   // ISO date
}

/**
 * Sync queue item for offline support
 */
export interface SyncQueueItem {
  id: string
  type: 'tag' | 'project-org' | 'note' | 'todo' | 'machine'
  action: 'create' | 'update' | 'delete'
  data: unknown
  timestamp: string    // ISO date
  retryCount: number
}

/**
 * Complete organization data structure
 */
export interface OrganizationData {
  tags: Tag[]
  projectOrganizations: Record<number, ProjectOrganization>
  notes: Record<number, ProjectNote>
  todos: TodoItem[]
  machineInfo: MachineInfo
  syncQueue: SyncQueueItem[]
  lastSyncAt: string | null
}

/**
 * Limits for organization data
 */
export const ORGANIZATION_LIMITS = {
  MAX_TAGS: 50,
  MAX_TODOS_PER_PROJECT: 50,
  MAX_TODOS_TOTAL: 500,
  MAX_NOTE_LENGTH: 10000,
  MAX_NOTES_SIZE: 1024 * 1024, // 1 MB
  MAX_PINNED_PROJECTS: 5,
}
