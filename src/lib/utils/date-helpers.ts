/**
 * Date formatting and helper utilities
 */

import { 
  format, 
  formatDistanceToNow, 
  isToday, 
  isYesterday,
  startOfWeek,
  endOfWeek,
  parseISO
} from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import type { DateFormat, Language } from '@/types'

/**
 * Get locale based on language setting
 */
function getLocale(language: Language = 'fr') {
  return language === 'fr' ? fr : enUS
}

/**
 * Format date based on user preference
 */
export function formatDate(
  date: string | Date, 
  dateFormat: DateFormat = 'relative',
  language: Language = 'fr'
): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const locale = getLocale(language)
  
  switch (dateFormat) {
    case 'relative':
      if (isToday(d)) {
        return language === 'fr' ? "Aujourd'hui" : 'Today'
      }
      if (isYesterday(d)) {
        return language === 'fr' ? 'Hier' : 'Yesterday'
      }
      return formatDistanceToNow(d, { addSuffix: true, locale })
    
    case 'eu':
      return format(d, 'dd/MM/yyyy', { locale })
    
    case 'us':
      return format(d, 'MM/dd/yyyy', { locale })
    
    default:
      return format(d, 'dd/MM/yyyy', { locale })
  }
}

/**
 * Format date with time
 */
export function formatDateTime(
  date: string | Date,
  dateFormat: DateFormat = 'relative',
  language: Language = 'fr'
): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const locale = getLocale(language)
  
  if (dateFormat === 'relative') {
    return formatDistanceToNow(d, { addSuffix: true, locale })
  }
  
  const dateStr = formatDate(date, dateFormat, language)
  const timeStr = format(d, 'HH:mm', { locale })
  return `${dateStr} à ${timeStr}`
}

/**
 * Format time only
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm')
}

/**
 * Format week range (e.g., "Lun 18 - Dim 24 Déc 2024")
 */
export function formatWeekRange(
  startDate: string | Date,
  language: Language = 'fr'
): string {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate
  const end = endOfWeek(start, { weekStartsOn: 1 })
  const locale = getLocale(language)
  
  const startStr = format(start, 'EEE d', { locale })
  const endStr = format(end, 'EEE d MMM yyyy', { locale })
  
  return `${startStr} - ${endStr}`
}

/**
 * Format month and year
 */
export function formatMonthYear(
  date: string | Date,
  language: Language = 'fr'
): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const locale = getLocale(language)
  return format(d, 'MMMM yyyy', { locale })
}

/**
 * Get day name
 */
export function getDayName(
  dayIndex: number, 
  short: boolean = true,
  language: Language = 'fr'
): string {
  const days = language === 'fr' 
    ? (short 
        ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
        : ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'])
    : (short
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
  
  return days[dayIndex] || ''
}

/**
 * Get relative time string
 */
export function getRelativeTime(
  date: string | Date,
  language: Language = 'fr'
): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const locale = getLocale(language)
  return formatDistanceToNow(d, { addSuffix: true, locale })
}

/**
 * Check if date is within last N days
 */
export function isWithinLastDays(date: string | Date, days: number): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const daysDiff = diff / (1000 * 60 * 60 * 24)
  return daysDiff <= days
}

/**
 * Get start of current week (Monday)
 */
export function getCurrentWeekStart(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

/**
 * Get date N weeks ago
 */
export function getWeeksAgo(weeks: number): Date {
  const now = new Date()
  return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000)
}
