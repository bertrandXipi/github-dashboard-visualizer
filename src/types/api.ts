/**
 * GitHub API error types
 */
export type GitHubErrorType = 
  | 'user-not-found'
  | 'auth-failed'
  | 'rate-limit'
  | 'network-error'
  | 'unknown'

/**
 * GitHub API error response
 */
export interface GitHubAPIError {
  type: GitHubErrorType
  message: string
  status?: number
  resetTime?: number // Unix timestamp for rate limit reset
}

/**
 * Rate limit information from GitHub API
 */
export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number // Unix timestamp
  used: number
}

/**
 * Loading state for async operations
 */
export interface LoadingState {
  isLoading: boolean
  progress: number // 0-100
  stage: string
  error: GitHubAPIError | null
}

/**
 * Initial loading stages
 */
export const LOADING_STAGES = {
  FETCHING_PROFILE: { progress: 10, message: 'Récupération du profil...' },
  FETCHING_REPOS: { progress: 30, message: 'Récupération de tes repos...' },
  FETCHING_COMMITS: { progress: 60, message: 'Chargement des commits...' },
  CALCULATING_STATS: { progress: 85, message: 'Calcul des statistiques...' },
  FINALIZING: { progress: 95, message: 'Finalisation...' },
  COMPLETE: { progress: 100, message: 'Terminé !' },
} as const

/**
 * Sync status
 */
export interface SyncStatus {
  isSyncing: boolean
  lastSync: string | null // ISO date string
  hasNewData: boolean
  error: GitHubAPIError | null
}
