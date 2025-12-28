/**
 * GitHub API response types
 */

export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
  name: string | null
  bio: string | null
  location: string | null
  public_repos: number
  followers: number
  following: number
  created_at: string
}

export interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  created_at: string
  updated_at: string
  pushed_at: string | null
  default_branch: string
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  html_url: string
  stats?: {
    additions: number
    deletions: number
    total: number
  }
  files?: {
    filename: string
    status: string
    additions: number
    deletions: number
  }[]
}

export interface GitHubCommitActivity {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  html_url: string
}

export interface GitHubRateLimit {
  resources: {
    core: {
      limit: number
      remaining: number
      reset: number
      used: number
    }
  }
}
