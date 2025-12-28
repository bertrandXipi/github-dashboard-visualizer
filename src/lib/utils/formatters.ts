/**
 * Data formatting utilities
 */

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, locale: string = 'fr-FR'): string {
  return num.toLocaleString(locale)
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Get first line of a multi-line string
 */
export function getFirstLine(text: string): string {
  return text.split('\n')[0] || text
}

/**
 * Format commit message (first line, truncated)
 */
export function formatCommitMessage(message: string, maxLength: number = 80): string {
  const firstLine = getFirstLine(message)
  return truncate(firstLine, maxLength)
}

/**
 * Format lines changed (e.g., "+123 / -45")
 */
export function formatLinesChanged(additions: number, deletions: number): string {
  return `+${formatNumber(additions)} / -${formatNumber(deletions)}`
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Pluralize a word based on count
 */
export function pluralize(
  count: number, 
  singular: string, 
  plural: string
): string {
  return count === 1 ? singular : plural
}

/**
 * Format count with label (e.g., "5 commits", "1 projet")
 */
export function formatCount(
  count: number, 
  singular: string, 
  plural: string
): string {
  return `${formatNumber(count)} ${pluralize(count, singular, plural)}`
}

/**
 * Get language color (GitHub-style)
 */
export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Vue: '#41b883',
    Shell: '#89e051',
    Dockerfile: '#384d54',
  }
  
  return colors[language] || '#8b8b8b'
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
