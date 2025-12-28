/**
 * Calculation utilities for activity data
 */

import { 
  differenceInDays, 
  startOfDay, 
  subDays, 
  isSameDay,
  startOfWeek,
  endOfWeek,
  format,
  getDay,
  addDays,
  isWithinInterval,
  parseISO
} from 'date-fns'
import { fr } from 'date-fns/locale'
import type { 
  Repository, 
  RepositoryStatus, 
  Commit, 
  WeekActivity,
  GlobalStats,
  HeatmapDay
} from '@/types'

// ============ Repository Status ============

/**
 * Calculate repository status based on last commit date
 * - active: < 7 days
 * - warm: 7-30 days
 * - cold: 30-90 days
 * - archived: > 90 days
 */
export function calculateRepoStatus(lastCommitDate: string | null): RepositoryStatus {
  if (!lastCommitDate) return 'archived'
  
  const daysSinceLastCommit = differenceInDays(
    new Date(), 
    new Date(lastCommitDate)
  )
  
  if (daysSinceLastCommit < 7) return 'active'
  if (daysSinceLastCommit < 30) return 'warm'
  if (daysSinceLastCommit < 90) return 'cold'
  return 'archived'
}

/**
 * Get status badge color
 */
export function getStatusColor(status: RepositoryStatus): string {
  switch (status) {
    case 'active': return 'bg-green-500'
    case 'warm': return 'bg-yellow-500'
    case 'cold': return 'bg-blue-500'
    case 'archived': return 'bg-gray-500'
  }
}

/**
 * Get status label in French
 */
export function getStatusLabel(status: RepositoryStatus): string {
  switch (status) {
    case 'active': return 'Actif'
    case 'warm': return 'Tiède'
    case 'cold': return 'Froid'
    case 'archived': return 'Archivé'
  }
}

// ============ Streak Calculation ============

/**
 * Calculate current streak (consecutive days with commits)
 * Starts from today and counts backwards
 */
export function calculateStreak(commits: Commit[]): number {
  if (commits.length === 0) return 0
  
  // Sort commits by date descending
  const sortedCommits = [...commits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  
  const today = startOfDay(new Date())
  let streak = 0
  let currentDay = today
  
  // Check if there's a commit today or yesterday to start the streak
  const hasCommitToday = sortedCommits.some(c => 
    isSameDay(new Date(c.date), today)
  )
  const hasCommitYesterday = sortedCommits.some(c => 
    isSameDay(new Date(c.date), subDays(today, 1))
  )
  
  // If no commit today or yesterday, streak is 0
  if (!hasCommitToday && !hasCommitYesterday) return 0
  
  // If no commit today but there was yesterday, start from yesterday
  if (!hasCommitToday) {
    currentDay = subDays(today, 1)
  }
  
  // Count consecutive days with commits
  while (true) {
    const hasCommit = sortedCommits.some(c => 
      isSameDay(new Date(c.date), currentDay)
    )
    
    if (!hasCommit) break
    
    streak++
    currentDay = subDays(currentDay, 1)
  }
  
  return streak
}

/**
 * Calculate longest streak from commit history
 */
export function calculateLongestStreak(commits: Commit[]): number {
  if (commits.length === 0) return 0
  
  // Get unique dates with commits
  const datesWithCommits = new Set(
    commits.map(c => startOfDay(new Date(c.date)).toISOString())
  )
  
  const sortedDates = Array.from(datesWithCommits)
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime())
  
  if (sortedDates.length === 0) return 0
  
  let longestStreak = 1
  let currentStreak = 1
  
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = differenceInDays(sortedDates[i], sortedDates[i - 1])
    
    if (diff === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }
  
  return longestStreak
}

// ============ Week Activity ============

/**
 * Get week ID in format YYYY-WW
 */
export function getWeekId(date: Date): string {
  return format(date, "yyyy-'W'II", { locale: fr })
}

/**
 * Aggregate commits into week activity
 */
export function aggregateWeekActivity(
  commits: Commit[], 
  weekStart: Date
): WeekActivity {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  
  const weekCommits = commits.filter(c => {
    const commitDate = new Date(c.date)
    return isWithinInterval(commitDate, { start: weekStart, end: weekEnd })
  })
  
  // Calculate daily commits (Mon=0 to Sun=6)
  const dailyCommits = Array(7).fill(0)
  weekCommits.forEach(c => {
    const commitDate = new Date(c.date)
    // getDay returns 0 for Sunday, we want Monday=0
    let dayIndex = getDay(commitDate) - 1
    if (dayIndex < 0) dayIndex = 6 // Sunday becomes 6
    dailyCommits[dayIndex]++
  })
  
  // Get unique repos touched
  const reposTouched = [...new Set(weekCommits.map(c => c.repoName))]
  
  // Calculate lines added/deleted
  const linesAdded = weekCommits.reduce((sum, c) => sum + c.additions, 0)
  const linesDeleted = weekCommits.reduce((sum, c) => sum + c.deletions, 0)
  
  return {
    weekId: getWeekId(weekStart),
    startDate: weekStart.toISOString(),
    endDate: weekEnd.toISOString(),
    totalCommits: weekCommits.length,
    reposTouched,
    dailyCommits,
    linesAdded,
    linesDeleted,
    newRepos: [], // To be calculated separately if needed
  }
}

/**
 * Generate week activities for the last N weeks
 */
export function generateWeeksActivity(
  commits: Commit[], 
  weeksCount: number = 12
): Record<string, WeekActivity> {
  const weeks: Record<string, WeekActivity> = {}
  const today = new Date()
  
  for (let i = 0; i < weeksCount; i++) {
    const weekStart = startOfWeek(subDays(today, i * 7), { weekStartsOn: 1 })
    const activity = aggregateWeekActivity(commits, weekStart)
    weeks[activity.weekId] = activity
  }
  
  return weeks
}

// ============ Global Stats ============

/**
 * Get most used language from repositories
 */
export function getMostUsedLanguage(repos: Repository[]): string | null {
  const languageCounts: Record<string, number> = {}
  
  repos.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
    }
  })
  
  const entries = Object.entries(languageCounts)
  if (entries.length === 0) return null
  
  return entries.reduce((max, [lang, count]) => 
    count > max[1] ? [lang, count] : max
  , ['', 0])[0] || null
}

/**
 * Get most active project from commits
 */
export function getMostActiveProject(commits: Commit[]): string | null {
  if (commits.length === 0) return null
  
  const repoCounts: Record<string, number> = {}
  
  commits.forEach(c => {
    repoCounts[c.repoName] = (repoCounts[c.repoName] || 0) + 1
  })
  
  const entries = Object.entries(repoCounts)
  if (entries.length === 0) return null
  
  return entries.reduce((max, [repo, count]) => 
    count > max[1] ? [repo, count] : max
  , ['', 0])[0] || null
}

/**
 * Calculate global statistics
 */
export function calculateGlobalStats(
  repos: Repository[], 
  commits: Commit[]
): GlobalStats {
  const linesAdded = commits.reduce((sum, c) => sum + c.additions, 0)
  const linesDeleted = commits.reduce((sum, c) => sum + c.deletions, 0)
  
  return {
    totalProjects: repos.length,
    totalCommits: commits.length,
    mostActiveProject: getMostActiveProject(commits),
    mostUsedLanguage: getMostUsedLanguage(repos),
    currentStreak: calculateStreak(commits),
    longestStreak: calculateLongestStreak(commits),
    linesAdded,
    linesDeleted,
  }
}

// ============ Heatmap ============

/**
 * Get activity level for heatmap (0-4)
 */
export function getActivityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 10) return 3
  return 4
}

/**
 * Generate heatmap data for a month
 */
export function generateHeatmapData(
  commits: Commit[], 
  year: number, 
  month: number
): HeatmapDay[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: HeatmapDay[] = []
  
  let currentDay = firstDay
  while (currentDay <= lastDay) {
    const dayCommits = commits.filter(c => 
      isSameDay(new Date(c.date), currentDay)
    )
    
    days.push({
      date: currentDay.toISOString(),
      count: dayCommits.length,
      level: getActivityLevel(dayCommits.length),
    })
    
    currentDay = addDays(currentDay, 1)
  }
  
  return days
}

// ============ Today's Activity ============

/**
 * Get today's commits
 */
export function getTodayCommits(commits: Commit[]): Commit[] {
  const today = startOfDay(new Date())
  return commits.filter(c => isSameDay(new Date(c.date), today))
}

/**
 * Get today's active projects
 */
export function getTodayProjects(commits: Commit[]): string[] {
  const todayCommits = getTodayCommits(commits)
  return [...new Set(todayCommits.map(c => c.repoName))]
}

// ============ Activity Data for Charts ============

/**
 * Get activity data for the last N days (for mini charts)
 */
export function getActivityData(commits: Commit[], days: number = 30): number[] {
  const today = startOfDay(new Date())
  const data: number[] = []
  
  for (let i = days - 1; i >= 0; i--) {
    const day = subDays(today, i)
    const count = commits.filter(c => isSameDay(new Date(c.date), day)).length
    data.push(count)
  }
  
  return data
}

/**
 * Get activity data for a specific repository
 */
export function getRepoActivityData(
  commits: Commit[], 
  repoName: string, 
  days: number = 30
): number[] {
  const repoCommits = commits.filter(c => c.repoName === repoName)
  return getActivityData(repoCommits, days)
}
