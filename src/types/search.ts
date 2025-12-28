import type { Commit } from './activity'
import type { Repository } from './repository'

/**
 * Search result types
 */
export type SearchResultType = 'commit' | 'repository' | 'file'

/**
 * Date range filter options
 */
export type DateRangePreset = 'today' | 'thisWeek' | 'thisMonth' | 'custom'

/**
 * Search filters
 */
export interface SearchFilters {
  dateRange: DateRangePreset
  customStartDate?: string // ISO date string
  customEndDate?: string // ISO date string
  projects: string[] // Repository names (empty = all)
  languages: string[] // Languages (empty = all)
  types: SearchResultType[] // Result types (empty = all)
}

/**
 * Default search filters
 */
export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  dateRange: 'thisMonth',
  projects: [],
  languages: [],
  types: [],
}

/**
 * A single search result
 */
export interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  description: string
  projectName: string
  date: string // ISO date string
  url: string
  relevanceScore: number
  context?: {
    filesChanged?: string[]
    additions?: number
    deletions?: number
  }
}

/**
 * Search results with metadata
 */
export interface SearchResults {
  query: string
  filters: SearchFilters
  results: SearchResult[]
  totalCount: number
  searchTime: number // in milliseconds
}

/**
 * Convert a commit to a search result
 */
export function commitToSearchResult(commit: Commit, relevanceScore: number): SearchResult {
  return {
    id: commit.sha,
    type: 'commit',
    title: commit.message.split('\n')[0], // First line only
    description: commit.message,
    projectName: commit.repoName,
    date: commit.date,
    url: commit.url,
    relevanceScore,
    context: {
      filesChanged: commit.filesChanged,
      additions: commit.additions,
      deletions: commit.deletions,
    },
  }
}

/**
 * Convert a repository to a search result
 */
export function repositoryToSearchResult(repo: Repository, relevanceScore: number): SearchResult {
  return {
    id: repo.id.toString(),
    type: 'repository',
    title: repo.name,
    description: repo.description || '',
    projectName: repo.name,
    date: repo.updatedAt,
    url: repo.htmlUrl,
    relevanceScore,
  }
}
