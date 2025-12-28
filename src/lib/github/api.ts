/**
 * GitHub API Service
 */

import type { 
  UserProfile, 
  Repository, 
  Commit, 
  RateLimitInfo,
  GitHubAPIError,
  GitHubErrorType 
} from '@/types'
import type { 
  GitHubUser, 
  GitHubRepository, 
  GitHubCommit,
  GitHubCommitActivity,
  GitHubRateLimit 
} from './types'
import { calculateRepoStatus } from '@/lib/utils/calculations'
import { subMonths } from 'date-fns'

const GITHUB_API_BASE = 'https://api.github.com'

/**
 * Create headers for GitHub API requests
 */
function createHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}

/**
 * Parse GitHub API error response
 */
function parseError(status: number, message?: string): GitHubAPIError {
  let type: GitHubErrorType = 'unknown'
  let errorMessage = message || 'Une erreur est survenue'
  
  switch (status) {
    case 401:
      type = 'auth-failed'
      errorMessage = 'Token invalide ou expiré'
      break
    case 403:
      type = 'rate-limit'
      errorMessage = 'Limite API atteinte'
      break
    case 404:
      type = 'user-not-found'
      errorMessage = 'Utilisateur GitHub introuvable'
      break
    default:
      if (status >= 500) {
        type = 'network-error'
        errorMessage = 'Erreur serveur GitHub'
      }
  }
  
  return { type, message: errorMessage, status }
}

/**
 * Make a request to GitHub API
 */
async function fetchGitHub<T>(
  endpoint: string, 
  token?: string
): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, {
    headers: createHeaders(token),
  })
  
  if (!response.ok) {
    const error = parseError(response.status)
    
    // Check for rate limit
    if (response.status === 403) {
      const resetHeader = response.headers.get('X-RateLimit-Reset')
      if (resetHeader) {
        error.resetTime = parseInt(resetHeader, 10)
      }
    }
    
    throw error
  }
  
  return response.json()
}

/**
 * Fetch all pages of a paginated endpoint
 */
async function fetchAllPages<T>(
  endpoint: string,
  token?: string,
  maxPages: number = 10
): Promise<T[]> {
  const results: T[] = []
  let page = 1
  
  while (page <= maxPages) {
    const separator = endpoint.includes('?') ? '&' : '?'
    const url = `${endpoint}${separator}per_page=100&page=${page}`
    
    const response = await fetch(`${GITHUB_API_BASE}${url}`, {
      headers: createHeaders(token),
    })
    
    if (!response.ok) {
      throw parseError(response.status)
    }
    
    const data = await response.json() as T[]
    
    if (data.length === 0) break
    
    results.push(...data)
    
    // Check if there are more pages
    const linkHeader = response.headers.get('Link')
    if (!linkHeader || !linkHeader.includes('rel="next"')) break
    
    page++
  }
  
  return results
}

// ============ User Profile ============

/**
 * Get user profile from GitHub
 */
export async function getUserProfile(
  username: string, 
  token?: string
): Promise<UserProfile> {
  const user = await fetchGitHub<GitHubUser>(`/users/${username}`, token)
  
  return {
    username: user.login,
    avatarUrl: user.avatar_url,
    totalRepos: user.public_repos,
    memberSince: user.created_at,
    name: user.name || undefined,
    bio: user.bio || undefined,
    location: user.location || undefined,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
  }
}

// ============ Repositories ============

/**
 * Get all repositories for a user
 */
export async function getRepositories(
  username: string, 
  token?: string
): Promise<Repository[]> {
  // Fetch public repos
  const publicRepos = await fetchAllPages<GitHubRepository>(
    `/users/${username}/repos?sort=pushed`,
    token
  )
  
  // If token provided, also fetch private repos
  let allRepos = publicRepos
  if (token) {
    try {
      const privateRepos = await fetchAllPages<GitHubRepository>(
        `/user/repos?visibility=private&affiliation=owner`,
        token
      )
      allRepos = [...publicRepos, ...privateRepos]
    } catch {
      // Ignore errors for private repos
    }
  }
  
  // Remove duplicates and map to our type
  const seen = new Set<number>()
  return allRepos
    .filter(repo => {
      if (seen.has(repo.id)) return false
      seen.add(repo.id)
      return true
    })
    .map(repo => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      isPrivate: repo.private,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      lastCommitDate: repo.pushed_at,
      status: calculateRepoStatus(repo.pushed_at),
      htmlUrl: repo.html_url,
      defaultBranch: repo.default_branch,
    }))
}

// ============ Commits ============

/**
 * Get commits for a repository
 */
export async function getRepoCommits(
  owner: string,
  repo: string,
  since?: Date,
  token?: string
): Promise<Commit[]> {
  let endpoint = `/repos/${owner}/${repo}/commits`
  
  if (since) {
    endpoint += `?since=${since.toISOString()}`
  }
  
  try {
    const commits = await fetchAllPages<GitHubCommitActivity>(endpoint, token, 5)
    
    return commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      date: commit.commit.author.date,
      repoName: repo,
      repoFullName: `${owner}/${repo}`,
      filesChanged: [],
      additions: 0,
      deletions: 0,
      url: commit.html_url,
      authorName: commit.commit.author.name,
      authorEmail: commit.commit.author.email,
    }))
  } catch (error) {
    // Return empty array if repo has no commits or is empty
    if ((error as GitHubAPIError).status === 409) {
      return []
    }
    throw error
  }
}

/**
 * Get commit details (with stats)
 */
export async function getCommitDetails(
  owner: string,
  repo: string,
  sha: string,
  token?: string
): Promise<Commit> {
  const commit = await fetchGitHub<GitHubCommit>(
    `/repos/${owner}/${repo}/commits/${sha}`,
    token
  )
  
  return {
    sha: commit.sha,
    message: commit.commit.message,
    date: commit.commit.author.date,
    repoName: repo,
    repoFullName: `${owner}/${repo}`,
    filesChanged: commit.files?.map(f => f.filename) || [],
    additions: commit.stats?.additions || 0,
    deletions: commit.stats?.deletions || 0,
    url: commit.html_url,
    authorName: commit.commit.author.name,
    authorEmail: commit.commit.author.email,
  }
}

/**
 * Get all commits for a user across all repos
 */
export async function getAllUserCommits(
  username: string,
  repos: Repository[],
  monthsBack: number = 6,
  token?: string,
  onProgress?: (current: number, total: number) => void
): Promise<Commit[]> {
  const since = subMonths(new Date(), monthsBack)
  const allCommits: Commit[] = []
  
  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i]
    
    try {
      const commits = await getRepoCommits(
        username,
        repo.name,
        since,
        token
      )
      
      // Filter to only include commits by this user
      const userCommits = commits.filter(c => 
        c.authorEmail.toLowerCase().includes(username.toLowerCase()) ||
        c.authorName.toLowerCase().includes(username.toLowerCase())
      )
      
      allCommits.push(...userCommits)
    } catch (error) {
      // Skip repos that fail (empty, no access, etc.)
      console.warn(`Failed to fetch commits for ${repo.name}:`, error)
    }
    
    if (onProgress) {
      onProgress(i + 1, repos.length)
    }
  }
  
  // Sort by date descending
  return allCommits.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

// ============ Rate Limit ============

/**
 * Check rate limit status
 */
export async function checkRateLimit(token?: string): Promise<RateLimitInfo> {
  const data = await fetchGitHub<GitHubRateLimit>('/rate_limit', token)
  
  return {
    limit: data.resources.core.limit,
    remaining: data.resources.core.remaining,
    reset: data.resources.core.reset,
    used: data.resources.core.used,
  }
}

// ============ Validation ============

/**
 * Validate GitHub username exists
 */
export async function validateUsername(username: string): Promise<boolean> {
  try {
    await getUserProfile(username)
    return true
  } catch {
    return false
  }
}

/**
 * Validate GitHub token
 */
export async function validateToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: createHeaders(token),
    })
    return response.ok
  } catch {
    return false
  }
}


// ============ README ============

/**
 * Get README content for a repository
 */
export async function getReadme(
  owner: string,
  repo: string,
  token?: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`,
      {
        headers: {
          ...createHeaders(token),
          'Accept': 'application/vnd.github.raw+json',
        },
      }
    )
    
    if (!response.ok) {
      return null
    }
    
    const content = await response.text()
    // Limit to first 4000 chars to avoid token limits
    return content.slice(0, 4000)
  } catch {
    return null
  }
}
