/**
 * Settings Store
 */

import { create } from 'zustand'
import type { Settings, DateFormat, Theme, Language } from '@/types'
import { DEFAULT_SETTINGS } from '@/types'
import { getSettings, saveSettings } from '@/lib/storage'

interface SettingsState extends Settings {
  // Actions
  updateSettings: (updates: Partial<Settings>) => void
  setTheme: (theme: Theme) => void
  setDateFormat: (format: DateFormat) => void
  setWeeksToDisplay: (weeks: number) => void
  setLanguage: (language: Language) => void
  setOfflineMode: (enabled: boolean) => void
  loadFromCache: () => void
  resetToDefaults: () => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state from defaults
  ...DEFAULT_SETTINGS,
  
  updateSettings: (updates: Partial<Settings>) => {
    const newSettings = { ...get(), ...updates }
    saveSettings(newSettings)
    set(updates)
  },
  
  setTheme: (theme: Theme) => {
    get().updateSettings({ theme })
  },
  
  setDateFormat: (dateFormat: DateFormat) => {
    get().updateSettings({ dateFormat })
  },
  
  setWeeksToDisplay: (weeksToDisplay: number) => {
    // Clamp between 4 and 24
    const clamped = Math.max(4, Math.min(24, weeksToDisplay))
    get().updateSettings({ weeksToDisplay: clamped })
  },
  
  setLanguage: (language: Language) => {
    get().updateSettings({ language })
  },
  
  setOfflineMode: (offlineMode: boolean) => {
    get().updateSettings({ offlineMode })
  },
  
  loadFromCache: () => {
    const settings = getSettings()
    set(settings)
  },
  
  resetToDefaults: () => {
    saveSettings(DEFAULT_SETTINGS)
    set(DEFAULT_SETTINGS)
  },
}))
