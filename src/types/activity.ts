/**
 * A single commit from GitHub
 */
export interface Commit {
  sha: string
  message: string
  date: string // ISO date string
  repoName: string
  repoFullName: string
  filesChanged: string[]
  additions: number
  deletions: number
  url: string
  authorName: string
  authorEmail: string
}

/**
 * Activity data for a single week
 */
export interface WeekActivity {
  weekId: string // Format: YYYY-WW (e.g., "2024-52")
  startDate: string // ISO date string (Monday)
  endDate: string // ISO date string (Sunday)
  totalCommits: number
  reposTouched: string[] // Repository names
  dailyCommits: number[] // 7 values [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  linesAdded: number
  linesDeleted: number
  newRepos: string[] // Repos created this week
}

/**
 * Activity data for a single day
 */
export interface DayActivity {
  date: string // ISO date string
  commits: Commit[]
  totalCommits: number
  reposTouched: string[]
}

/**
 * Global statistics calculated from all activity
 */
export interface GlobalStats {
  totalProjects: number
  totalCommits: number
  mostActiveProject: string | null
  mostUsedLanguage: string | null
  currentStreak: number
  longestStreak: number
  linesAdded: number
  linesDeleted: number
}

/**
 * Heatmap data for calendar display
 */
export interface HeatmapDay {
  date: string // ISO date string
  count: number
  level: 0 | 1 | 2 | 3 | 4 // Activity level for coloring
}
