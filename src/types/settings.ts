/**
 * Date format options
 */
export type DateFormat = 'eu' | 'us' | 'relative'

/**
 * Theme options
 */
export type Theme = 'light' | 'dark' | 'system'

/**
 * Language options
 */
export type Language = 'fr' | 'en'

/**
 * User settings stored locally
 */
export interface Settings {
  theme: Theme
  dateFormat: DateFormat
  weeksToDisplay: number // 4-24
  language: Language
  offlineMode: boolean
}

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  dateFormat: 'relative',
  weeksToDisplay: 12,
  language: 'fr',
  offlineMode: false,
}
