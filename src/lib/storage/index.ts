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
