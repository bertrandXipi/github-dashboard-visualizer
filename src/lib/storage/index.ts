// Crypto exports
export { 
  CryptoService, 
  cryptoService,
  generateSalt,
  deriveKey,
  encryptToken,
  decryptToken 
} from './crypto'

// Cache exports
export {
  // User Profile
  getUserProfile,
  saveUserProfile,
  
  // Repositories
  getRepositories,
  saveRepositories,
  updateRepository,
  
  // Commits
  getCommits,
  saveCommits,
  addCommits,
  getCommitsByRepo,
  getCommitsByDateRange,
  
  // Week Activity
  getWeeksActivity,
  saveWeeksActivity,
  getWeekActivity,
  updateWeekActivity,
  
  // Global Stats
  getGlobalStats,
  saveGlobalStats,
  
  // Auth
  getAuthCredentials,
  saveAuthCredentials,
  clearAuthCredentials,
  
  // Settings
  getSettings,
  saveSettings,
  updateSettings,
  
  // Metadata
  getCacheMetadata,
  saveCacheMetadata,
  updateLastSync,
  
  // Cache Management
  getCacheSize,
  isCacheFull,
  clearCache,
  clearAllData,
  
  // Staleness
  isCurrentWeekStale,
  isPastWeekStale,
  
  // Full Cache
  getActivityCache,
  saveActivityCache,
  exportAllData,
} from './cache'

// Organization Cache exports
export {
  ORG_CACHE_KEYS,
  // Tags
  getTags,
  saveTags,
  // Project Organizations
  getProjectOrganizations,
  saveProjectOrganizations,
  // Notes
  getNotes,
  saveNotes,
  // TODOs
  getTodos,
  saveTodos,
  // Machine Info
  getMachineInfo,
  saveMachineInfo,
  getOrCreateMachineId,
  // Sync Queue
  getSyncQueue,
  saveSyncQueue,
  addToSyncQueue,
  removeFromSyncQueue,
  incrementSyncRetry,
  // Last Sync
  getLastSyncAt,
  saveLastSyncAt,
  // Migration & Initialization
  initializeDefaultTags,
  clearOrganizationData,
} from './organization-cache'
