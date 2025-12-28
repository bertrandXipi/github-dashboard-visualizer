/**
 * Organization Migration - Handles data migration for organization features
 */

import type { Tag, ProjectOrganization } from '@/types'
import { DEFAULT_TAGS } from '@/types'
import {
  getTags,
  saveTags,
  getProjectOrganizations,
  saveProjectOrganizations,
  ORG_CACHE_KEYS,
} from './organization-cache'

const MIGRATION_VERSION_KEY = 'github-tracker-org-migration-version'
const CURRENT_MIGRATION_VERSION = 1

interface MigrationResult {
  success: boolean
  version: number
  errors: string[]
  warnings: string[]
}

/**
 * Check if migration is needed
 */
export function isMigrationNeeded(): boolean {
  if (typeof window === 'undefined') return false
  
  const currentVersion = localStorage.getItem(MIGRATION_VERSION_KEY)
  if (!currentVersion) return true
  
  const version = parseInt(currentVersion, 10)
  return isNaN(version) || version < CURRENT_MIGRATION_VERSION
}

/**
 * Get current migration version
 */
export function getMigrationVersion(): number {
  if (typeof window === 'undefined') return 0
  
  const version = localStorage.getItem(MIGRATION_VERSION_KEY)
  if (!version) return 0
  
  const parsed = parseInt(version, 10)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Set migration version
 */
function setMigrationVersion(version: number): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MIGRATION_VERSION_KEY, version.toString())
}

/**
 * Initialize default tags if none exist
 */
function initializeDefaultTags(): Tag[] {
  const existingTags = getTags()
  if (existingTags.length > 0) {
    console.log('[Migration] Tags already exist, skipping default initialization')
    return existingTags
  }
  
  const now = new Date().toISOString()
  const defaultTags: Tag[] = DEFAULT_TAGS.map(tag => ({
    ...tag,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }))
  
  saveTags(defaultTags)
  console.log('[Migration] Initialized default tags:', defaultTags.map(t => t.name))
  return defaultTags
}

/**
 * Initialize empty organization data for existing projects
 * This preserves all existing GitHub data while adding organization fields
 */
function initializeProjectOrganizations(projectIds: number[]): Record<number, ProjectOrganization> {
  const existingOrgs = getProjectOrganizations()
  const now = new Date().toISOString()
  
  let newCount = 0
  const updatedOrgs = { ...existingOrgs }
  
  for (const projectId of projectIds) {
    if (!updatedOrgs[projectId]) {
      updatedOrgs[projectId] = {
        projectId,
        tagIds: [],
        isFavorite: false,
        isPinned: false,
        manualStatus: null,
        manualStatusDate: null,
        clonedOnMachines: [],
      }
      newCount++
    }
  }
  
  if (newCount > 0) {
    saveProjectOrganizations(updatedOrgs)
    console.log(`[Migration] Initialized organization data for ${newCount} projects`)
  }
  
  return updatedOrgs
}

/**
 * Get project IDs from existing GitHub cache
 */
function getExistingProjectIds(): number[] {
  if (typeof window === 'undefined') return []
  
  const projectIds: number[] = []
  
  // Check for cached repositories in the activity store cache
  const cacheKeys = [
    'github-tracker-repos',
    'github-tracker-user-repos',
  ]
  
  for (const key of cacheKeys) {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        const parsed = JSON.parse(data)
        // Handle different cache formats
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item.id && typeof item.id === 'number') {
              projectIds.push(item.id)
            }
          }
        } else if (parsed.data && Array.isArray(parsed.data)) {
          for (const item of parsed.data) {
            if (item.id && typeof item.id === 'number') {
              projectIds.push(item.id)
            }
          }
        }
      }
    } catch (error) {
      console.warn(`[Migration] Failed to parse cache key ${key}:`, error)
    }
  }
  
  // Remove duplicates
  return [...new Set(projectIds)]
}

/**
 * Verify existing GitHub data is preserved
 */
function verifyGitHubDataPreserved(): { preserved: boolean; warnings: string[] } {
  const warnings: string[] = []
  
  // List of GitHub cache keys that should be preserved
  const githubCacheKeys = [
    'github-tracker-repos',
    'github-tracker-user-repos',
    'github-tracker-user',
    'github-tracker-activity',
    'github-tracker-token',
  ]
  
  for (const key of githubCacheKeys) {
    try {
      const data = localStorage.getItem(key)
      if (data) {
        // Verify it's valid JSON
        JSON.parse(data)
      }
    } catch (error) {
      warnings.push(`GitHub cache key ${key} may be corrupted`)
    }
  }
  
  return {
    preserved: warnings.length === 0,
    warnings,
  }
}

/**
 * Run migration from version 0 to version 1
 * - Initialize default tags
 * - Create empty organization data for existing projects
 */
function migrateV0ToV1(): { success: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    console.log('[Migration] Starting migration from v0 to v1')
    
    // Step 1: Initialize default tags
    initializeDefaultTags()
    
    // Step 2: Get existing project IDs from GitHub cache
    const projectIds = getExistingProjectIds()
    console.log(`[Migration] Found ${projectIds.length} existing projects`)
    
    // Step 3: Initialize organization data for existing projects
    initializeProjectOrganizations(projectIds)
    
    console.log('[Migration] Migration v0 to v1 completed successfully')
    return { success: true, errors }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(`Migration v0 to v1 failed: ${errorMessage}`)
    console.error('[Migration] Migration failed:', error)
    return { success: false, errors }
  }
}

/**
 * Run all necessary migrations
 */
export function runMigration(): MigrationResult {
  const result: MigrationResult = {
    success: true,
    version: CURRENT_MIGRATION_VERSION,
    errors: [],
    warnings: [],
  }
  
  if (typeof window === 'undefined') {
    result.success = false
    result.errors.push('Migration cannot run on server side')
    return result
  }
  
  console.log('[Migration] Starting migration process')
  
  // Verify GitHub data is preserved
  const { preserved, warnings } = verifyGitHubDataPreserved()
  result.warnings.push(...warnings)
  
  if (!preserved) {
    console.warn('[Migration] Some GitHub data may be corrupted:', warnings)
  }
  
  const currentVersion = getMigrationVersion()
  console.log(`[Migration] Current version: ${currentVersion}, Target version: ${CURRENT_MIGRATION_VERSION}`)
  
  // Run migrations in order
  if (currentVersion < 1) {
    const migrationResult = migrateV0ToV1()
    if (!migrationResult.success) {
      result.success = false
      result.errors.push(...migrationResult.errors)
      return result
    }
  }
  
  // Update migration version
  setMigrationVersion(CURRENT_MIGRATION_VERSION)
  console.log(`[Migration] Migration completed. Version set to ${CURRENT_MIGRATION_VERSION}`)
  
  return result
}

/**
 * Reset organization data (for error recovery)
 */
export function resetOrganizationData(): void {
  if (typeof window === 'undefined') return
  
  console.log('[Migration] Resetting organization data')
  
  // Remove all organization cache keys
  Object.values(ORG_CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
  
  // Remove migration version to trigger fresh migration
  localStorage.removeItem(MIGRATION_VERSION_KEY)
  
  console.log('[Migration] Organization data reset complete')
}

/**
 * Export migration status for debugging
 */
export function getMigrationStatus(): {
  currentVersion: number
  targetVersion: number
  needsMigration: boolean
  organizationDataExists: boolean
} {
  return {
    currentVersion: getMigrationVersion(),
    targetVersion: CURRENT_MIGRATION_VERSION,
    needsMigration: isMigrationNeeded(),
    organizationDataExists: getTags().length > 0 || Object.keys(getProjectOrganizations()).length > 0,
  }
}
