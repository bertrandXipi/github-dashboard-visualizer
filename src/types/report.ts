import type { WeekActivity } from './activity'

/**
 * Report type
 */
export type ReportType = 'weekly' | 'monthly' | 'custom'

/**
 * Report configuration
 */
export interface ReportConfig {
  type: ReportType
  startDate: string // ISO date string
  endDate: string // ISO date string
  includeHighlights: boolean
  includeDailyBreakdown: boolean
  includeProjectDetails: boolean
}

/**
 * Project summary for reports
 */
export interface ProjectSummary {
  name: string
  commits: number
  linesAdded: number
  linesDeleted: number
  topCommitMessages: string[]
}

/**
 * Report highlights
 */
export interface ReportHighlights {
  biggestCommit: {
    message: string
    linesChanged: number
    repo: string
  } | null
  mostProductiveDay: {
    date: string
    commits: number
  } | null
  currentStreak: number
  newProjects: string[]
}

/**
 * Generated report data
 */
export interface ReportData {
  config: ReportConfig
  title: string
  period: string
  overview: {
    totalCommits: number
    projectsTouched: number
    linesAdded: number
    linesDeleted: number
  }
  projects: ProjectSummary[]
  dailyBreakdown: { day: string; commits: number }[]
  highlights: ReportHighlights
  weeksActivity: WeekActivity[]
  generatedAt: string // ISO date string
}

/**
 * Report output format
 */
export type ReportFormat = 'markdown' | 'json'
