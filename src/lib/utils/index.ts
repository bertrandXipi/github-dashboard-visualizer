// Re-export from shadcn utils
export { cn } from '../utils'

// Calculations
export {
  calculateRepoStatus,
  getStatusColor,
  getStatusLabel,
  calculateStreak,
  calculateLongestStreak,
  getWeekId,
  aggregateWeekActivity,
  generateWeeksActivity,
  getMostUsedLanguage,
  getMostActiveProject,
  calculateGlobalStats,
  getActivityLevel,
  generateHeatmapData,
  getTodayCommits,
  getTodayProjects,
  getActivityData,
  getRepoActivityData,
} from './calculations'

// Date helpers
export {
  formatDate,
  formatDateTime,
  formatTime,
  formatWeekRange,
  formatMonthYear,
  getDayName,
  getRelativeTime,
  isWithinLastDays,
  getCurrentWeekStart,
  getWeeksAgo,
} from './date-helpers'

// Formatters
export {
  formatNumber,
  formatBytes,
  truncate,
  getFirstLine,
  formatCommitMessage,
  formatLinesChanged,
  formatPercentage,
  pluralize,
  formatCount,
  getLanguageColor,
  formatDuration,
  getInitials,
  capitalize,
} from './formatters'
