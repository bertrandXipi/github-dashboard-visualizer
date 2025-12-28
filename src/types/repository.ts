/**
 * Repository status based on last commit date
 * - active: commit within 7 days
 * - warm: commit between 7-30 days
 * - cold: commit between 30-90 days
 * - archived: no commit for 90+ days
 */
export type RepositoryStatus = 'active' | 'warm' | 'cold' | 'archived'

/**
 * Repository information from GitHub
 */
export interface Repository {
  id: number
  name: string
  fullName: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  isPrivate: boolean
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  pushedAt: string | null // ISO date string
  lastCommitDate: string | null // ISO date string
  status: RepositoryStatus
  htmlUrl: string
  defaultBranch: string
  aiSummary?: string // AI-generated summary
  aiSummaryDate?: string // When the summary was generated
}

/**
 * Repository with activity data for display
 */
export interface RepositoryWithActivity extends Repository {
  recentCommits: number
  activityData: number[] // 30 days of commit counts
}

/**
 * Repository filter options
 */
export interface RepositoryFilters {
  search: string
  status: RepositoryStatus | 'all'
  language: string | 'all'
  sortBy: 'lastActivity' | 'name' | 'stars' | 'commits'
  sortOrder: 'asc' | 'desc'
}
