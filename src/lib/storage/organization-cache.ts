/**
 * Organization Cache - Handles LocalStorage operations for organization data
 */

import type {
  Tag,
  ProjectOrganization,
  ProjectNote,
  TodoItem,
  MachineInfo,
  SyncQueueItem,
} from '@/types'
import { DEFAULT_TAGS } from '@/types'

/**
 * Cache keys for organization data
 */
export const ORG_CACHE_KEYS = {
  TAGS: 'github-tracker-org-tags',
  PROJECT_ORG: 'github-tracker-org-projects',
  NOTES: 'github-tracker-org-notes',
  TODOS: 'github-tracker-org-todos',
  MACHINE: 'github-tracker-org-machine',
  SYNC_QUEUE: 'github-tracker-org-sync-queue',
  LAST_SYNC: 'github-tracker-org-last-sync',
}

/**
 * Check if LocalStorage is available
 */
function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const test = '__storage_test__'
    window.localStorage.setItem(test, test)
    window.localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Safely parse JSON from storage
 */
function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

// ============ Tags ============

export function getTags(): Tag[] {
  if (!isStorageAvailable()) return []
  const data = localStorage.getItem(ORG_CACHE_KEYS.TAGS)
  return safeJsonParse<Tag[]>(data, [])
}

export function saveTags(tags: Tag[]): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(ORG_CACHE_KEYS.TAGS, JSON.stringify(tags))
}

// ============ Project Organizations ============

export function getProjectOrganizations(): Record<number, ProjectOrganization> {
  if (!isStorageAvailable()) return {}
  const data = localStorage.getItem(ORG_CACHE_KEYS.PROJECT_ORG)
  return safeJsonParse<Record<number, ProjectOrganization>>(data, {})
}

export function saveProjectOrganizations(data: Record<number, ProjectOrganization>): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(ORG_CACHE_KEYS.PROJECT_ORG, JSON.stringify(data))
}

// ============ Notes ============

export function getNotes(): Record<number, ProjectNote> {
  if (!isStorageAvailable()) return {}
  const data = localStorage.getItem(ORG_CACHE_KEYS.NOTES)
  return safeJsonParse<Record<number, ProjectNote>>(data, {})
}

export function saveNotes(notes: Record<number, ProjectNote>): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(ORG_CACHE_KEYS.NOTES, JSON.stringify(notes))
}

// ============ TODOs ============

export function getTodos(): TodoItem[] {
  if (!isStorageAvailable()) return []
  const data = localStorage.getItem(ORG_CACHE_KEYS.TODOS)
  return safeJsonParse<TodoItem[]>(data, [])
}

export function saveTodos(todos: TodoItem[]): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(ORG_CACHE_KEYS.TODOS, JSON.stringify(todos))
}

// ============ Machine Info ============

export function getMachineInfo(): MachineInfo | null {
  if (!isStorageAvailable()) return null
  const data = localStorage.getItem(ORG_CACHE_KEYS.MACHINE)
  return safeJsonParse<MachineInfo | null>(data, null)
}

export function saveMachineInfo(info: MachineInfo): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(ORG_CACHE_KEYS.MACHINE, JSON.stringify(info))
}

export function getOrCreateMachineId(): string {
  const existing = getMachineInfo()
  if (existing) {
    // Update last seen
    const updated: MachineInfo = {
      ...existing,
      lastSeenAt: new Date().toISOString(),
    }
    saveMachineInfo(updated)
    return existing.id
  }
  
  // Create new machine info
  const newMachine: MachineInfo = {
    id: crypto.randomUUID(),
    name: '',
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  }
  saveMachineInfo(newMachine)
  return newMachine.id
}

// ============ Sync Queue ============

export function getSyncQueue(): SyncQueueItem[] {
  if (!isStorageAvailable()) return []
  const data = localStorage.getItem(ORG_CACHE_KEYS.SYNC_QUEUE)
  return safeJsonParse<SyncQueueItem[]>(data, [])
}

export function saveSyncQueue(queue: SyncQueueItem[]): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(ORG_CACHE_KEYS.SYNC_QUEUE, JSON.stringify(queue))
}

export function addToSyncQueue(
  item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>
): void {
  const queue = getSyncQueue()
  const newItem: SyncQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    retryCount: 0,
  }
  queue.push(newItem)
  saveSyncQueue(queue)
}

export function removeFromSyncQueue(id: string): void {
  const queue = getSyncQueue()
  const filtered = queue.filter(item => item.id !== id)
  saveSyncQueue(filtered)
}

export function incrementSyncRetry(id: string): void {
  const queue = getSyncQueue()
  const item = queue.find(i => i.id === id)
  if (item) {
    item.retryCount++
    saveSyncQueue(queue)
  }
}

// ============ Last Sync ============

export function getLastSyncAt(): string | null {
  if (!isStorageAvailable()) return null
  return localStorage.getItem(ORG_CACHE_KEYS.LAST_SYNC)
}

export function saveLastSyncAt(date: string): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(ORG_CACHE_KEYS.LAST_SYNC, date)
}

// ============ Migration & Initialization ============

export function initializeDefaultTags(): Tag[] {
  const existingTags = getTags()
  if (existingTags.length > 0) return existingTags
  
  const now = new Date().toISOString()
  const defaultTags: Tag[] = DEFAULT_TAGS.map(tag => ({
    ...tag,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }))
  
  saveTags(defaultTags)
  return defaultTags
}

export function clearOrganizationData(): void {
  if (!isStorageAvailable()) return
  
  Object.values(ORG_CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}
