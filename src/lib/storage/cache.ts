/**
 * CacheManager - Handles LocalStorage operations for activity data
 */

import type { 
  UserProfile, 
  Repository, 
  Commit, 
  WeekActivity, 
  GlobalStats,
  Settings,
  AuthCredentials 
} from '@/types'
import { 
  CACHE_KEYS, 
  CACHE_VERSION, 
  MAX_CACHE_SIZE,
  DEFAULT_SETTINGS 
} from '@/types'
import type { CacheMetadata, ActivityCache } from '@/types'

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

/**
 * Calculate the size of a string in bytes
 */
function getStringSize(str: string): number {
  return new Blob([str]).size
}

// ============ User Profile ============

export function getUserProfile(): UserProfile | null {
  if (!isStorageAvailable()) return null
  const data = localStorage.getItem(CACHE_KEYS.USER_PROFILE)
  return safeJsonParse<UserProfile | null>(data, null)
}

export function saveUserProfile(profile: UserProfile): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(CACHE_KEYS.USER_PROFILE, JSON.stringify(profile))
}

// ============ Repositories ============

export function getRepositories(): Repository[] {
  if (!isStorageAvailable()) return []
  const data = localStorage.getItem(CACHE_KEYS.REPOSITORIES)
  return safeJsonParse<Repository[]>(data, [])
}

export function saveRepositories(repos: Repository[]): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(CACHE_KEYS.REPOSITORIES, JSON.stringify(repos))
}

export function updateRepository(id: number, updates: Partial<Repository>): void {
  const repos = getRepositories()
  const index = repos.findIndex(r => r.id === id)
  if (index !== -1) {
    repos[index] = { ...repos[index], ...updates }
    saveRepositories(repos)
  }
}

// ============ Commits ============

export function getCommits(): Commit[] {
  if (!isStorageAvailable()) return []
  const data = localStorage.getItem(CACHE_KEYS.COMMITS)
  return safeJsonParse<Commit[]>(data, [])
}

export function saveCommits(commits: Commit[]): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(CACHE_KEYS.COMMITS, JSON.stringify(commits))
}

export function addCommits(newCommits: Commit[]): void {
  const existing = getCommits()
  const existingShas = new Set(existing.map(c => c.sha))
  const uniqueNew = newCommits.filter(c => !existingShas.has(c.sha))
  saveCommits([...existing, ...uniqueNew])
}

export function getCommitsByRepo(repoName: string): Commit[] {
  return getCommits().filter(c => c.repoName === repoName)
}

export function getCommitsByDateRange(startDate: string, endDate: string): Commit[] {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  return getCommits().filter(c => {
    const date = new Date(c.date).getTime()
    return date >= start && date <= end
  })
}

// ============ Week Activity ============

export function getWeeksActivity(): Record<string, WeekActivity> {
  if (!isStorageAvailable()) return {}
  const data = localStorage.getItem(CACHE_KEYS.WEEKS)
  return safeJsonParse<Record<string, WeekActivity>>(data, {})
}

export function saveWeeksActivity(weeks: Record<string, WeekActivity>): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(CACHE_KEYS.WEEKS, JSON.stringify(weeks))
}

export function getWeekActivity(weekId: string): WeekActivity | null {
  const weeks = getWeeksActivity()
  return weeks[weekId] || null
}

export function updateWeekActivity(weekId: string, activity: WeekActivity): void {
  const weeks = getWeeksActivity()
  weeks[weekId] = activity
  saveWeeksActivity(weeks)
}

// ============ Global Stats ============

export function getGlobalStats(): GlobalStats | null {
  if (!isStorageAvailable()) return null
  const data = localStorage.getItem(CACHE_KEYS.GLOBAL_STATS)
  return safeJsonParse<GlobalStats | null>(data, null)
}

export function saveGlobalStats(stats: GlobalStats): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(CACHE_KEYS.GLOBAL_STATS, JSON.stringify(stats))
}

// ============ Auth Credentials ============

export function getAuthCredentials(): AuthCredentials | null {
  if (!isStorageAvailable()) return null
  const data = localStorage.getItem(CACHE_KEYS.AUTH)
  return safeJsonParse<AuthCredentials | null>(data, null)
}

export function saveAuthCredentials(credentials: AuthCredentials): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(CACHE_KEYS.AUTH, JSON.stringify(credentials))
}

export function clearAuthCredentials(): void {
  if (!isStorageAvailable()) return
  localStorage.removeItem(CACHE_KEYS.AUTH)
}

// ============ Settings ============

export function getSettings(): Settings {
  if (!isStorageAvailable()) return DEFAULT_SETTINGS
  const data = localStorage.getItem(CACHE_KEYS.SETTINGS)
  return safeJsonParse<Settings>(data, DEFAULT_SETTINGS)
}

export function saveSettings(settings: Settings): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(settings))
}

export function updateSettings(updates: Partial<Settings>): void {
  const current = getSettings()
  saveSettings({ ...current, ...updates })
}

// ============ Cache Metadata ============

export function getCacheMetadata(): CacheMetadata {
  if (!isStorageAvailable()) {
    return {
      lastSync: null,
      cacheVersion: CACHE_VERSION,
      totalSize: 0,
      commitCount: 0,
      repoCount: 0,
      weekCount: 0,
    }
  }
  const data = localStorage.getItem(CACHE_KEYS.METADATA)
  return safeJsonParse<CacheMetadata>(data, {
    lastSync: null,
    cacheVersion: CACHE_VERSION,
    totalSize: 0,
    commitCount: 0,
    repoCount: 0,
    weekCount: 0,
  })
}

export function saveCacheMetadata(metadata: CacheMetadata): void {
  if (!isStorageAvailable()) return
  localStorage.setItem(CACHE_KEYS.METADATA, JSON.stringify(metadata))
}

export function updateLastSync(): void {
  const metadata = getCacheMetadata()
  metadata.lastSync = new Date().toISOString()
  saveCacheMetadata(metadata)
}

// ============ Cache Size & Management ============

export function getCacheSize(): number {
  if (!isStorageAvailable()) return 0
  
  let totalSize = 0
  Object.values(CACHE_KEYS).forEach(key => {
    const value = localStorage.getItem(key)
    if (value) {
      totalSize += getStringSize(value)
    }
  })
  return totalSize
}

export function isCacheFull(): boolean {
  return getCacheSize() >= MAX_CACHE_SIZE
}

export function clearCache(): void {
  if (!isStorageAvailable()) return
  
  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}

export function clearAllData(): void {
  if (!isStorageAvailable()) return
  
  // Remove all keys that start with 'github-tracker-'
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('github-tracker-')) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key))
}

// ============ Cache Staleness ============

const CURRENT_WEEK_MAX_AGE = 60 * 60 * 1000 // 1 hour in milliseconds

export function isCurrentWeekStale(lastSync: string | null): boolean {
  if (!lastSync) return true
  const syncTime = new Date(lastSync).getTime()
  const now = Date.now()
  return now - syncTime > CURRENT_WEEK_MAX_AGE
}

export function isPastWeekStale(): boolean {
  // Past weeks are never stale - they don't change
  return false
}

// ============ Full Cache Operations ============

export function getActivityCache(): ActivityCache {
  return {
    userProfile: getUserProfile(),
    repositories: getRepositories(),
    commits: getCommits(),
    weeksActivity: getWeeksActivity(),
    globalStats: getGlobalStats(),
    metadata: getCacheMetadata(),
  }
}

export function saveActivityCache(cache: Partial<ActivityCache>): void {
  if (cache.userProfile) saveUserProfile(cache.userProfile)
  if (cache.repositories) saveRepositories(cache.repositories)
  if (cache.commits) saveCommits(cache.commits)
  if (cache.weeksActivity) saveWeeksActivity(cache.weeksActivity)
  if (cache.globalStats) saveGlobalStats(cache.globalStats)
  
  // Update metadata
  const metadata = getCacheMetadata()
  metadata.lastSync = new Date().toISOString()
  metadata.cacheVersion = CACHE_VERSION
  metadata.totalSize = getCacheSize()
  metadata.commitCount = cache.commits?.length ?? getCommits().length
  metadata.repoCount = cache.repositories?.length ?? getRepositories().length
  metadata.weekCount = cache.weeksActivity 
    ? Object.keys(cache.weeksActivity).length 
    : Object.keys(getWeeksActivity()).length
  saveCacheMetadata(metadata)
}

// ============ Export for JSON ============

export function exportAllData(): string {
  const cache = getActivityCache()
  const settings = getSettings()
  const auth = getAuthCredentials()
  
  return JSON.stringify({
    cache,
    settings,
    auth: auth ? { username: auth.username } : null, // Don't export encrypted token
    exportedAt: new Date().toISOString(),
    version: CACHE_VERSION,
  }, null, 2)
}
