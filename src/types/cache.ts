import type { UserProfile } from './user'
import type { Repository } from './repository'
import type { Commit, WeekActivity, GlobalStats } from './activity'

/**
 * Cache metadata for tracking sync status
 */
export interface CacheMetadata {
  lastSync: string | null // ISO date string
  cacheVersion: string
  totalSize: number // in bytes
  commitCount: number
  repoCount: number
  weekCount: number
}

/**
 * Complete activity cache stored in LocalStorage
 */
export interface ActivityCache {
  userProfile: UserProfile | null
  repositories: Repository[]
  commits: Commit[]
  weeksActivity: Record<string, WeekActivity> // keyed by weekId
  globalStats: GlobalStats | null
  metadata: CacheMetadata
}

/**
 * Cache storage keys
 */
export const CACHE_KEYS = {
  USER_PROFILE: 'github-tracker-user-profile',
  REPOSITORIES: 'github-tracker-repositories',
  COMMITS: 'github-tracker-commits',
  WEEKS: 'github-tracker-weeks',
  GLOBAL_STATS: 'github-tracker-global-stats',
  METADATA: 'github-tracker-metadata',
  AUTH: 'github-tracker-auth',
  SETTINGS: 'github-tracker-settings',
} as const

/**
 * Current cache version for migration purposes
 */
export const CACHE_VERSION = '1.0.0'

/**
 * Maximum cache size in bytes (50 MB)
 */
export const MAX_CACHE_SIZE = 50 * 1024 * 1024
