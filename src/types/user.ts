/**
 * User profile information from GitHub
 */
export interface UserProfile {
  username: string
  avatarUrl: string
  totalRepos: number
  memberSince: string // ISO date string
  name?: string
  bio?: string
  location?: string
  publicRepos: number
  followers: number
  following: number
}

/**
 * Authentication credentials stored locally
 */
export interface AuthCredentials {
  username: string
  encryptedToken?: string
  salt?: string
}
