# Implementation Plan: GitHub Activity Tracker

## Overview

This implementation plan breaks down the GitHub Activity Tracker into discrete, manageable tasks. The approach follows an incremental development strategy, building core functionality first, then adding features progressively. Each task builds on previous work, ensuring the application remains functional at every stage.

The plan prioritizes the MVP (authentication, dashboard, repository list, caching) to deliver value quickly, then adds advanced features (search, reports, offline mode) in subsequent phases.

## Tasks

- [-] 1. Project Setup and Configuration
  - Initialize Next.js 14 project with TypeScript and App Router
  - Configure Tailwind CSS and install shadcn/ui
  - Set up project structure (app/, components/, lib/, hooks/, types/)
  - Install dependencies: zustand, swr, date-fns, recharts, lucide-react, fast-check
  - Configure ESLint, Prettier, and Vitest
  - Create basic layout with theme provider (light/dark mode)
  - _Requirements: Foundation for all features_


- [ ] 2. Type Definitions and Data Models
  - [ ] 2.1 Create core TypeScript types
    - Define UserProfile, Repository, Commit, WeekActivity interfaces
    - Define ActivityCache and CacheMetadata types
    - Define RepositoryStatus and other enums
    - _Requirements: 1.1, 2.2, 2.3, 2.4_
  
  - [ ]* 2.2 Write property test for type safety
    - **Property: Type definitions should allow valid data structures**
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [ ] 3. Crypto Service for Token Security
  - [ ] 3.1 Implement CryptoService class
    - Implement encryptToken() using Web Crypto API
    - Implement decryptToken() method
    - Implement generateSalt() method
    - Implement deriveKey() from salt
    - _Requirements: 1.5, 12.1, 12.2_
  
  - [ ]* 3.2 Write property test for encryption round-trip
    - **Property 1: Token Encryption Round-Trip**
    - **Validates: Requirements 1.5, 12.1**
  
  - [ ]* 3.3 Write property test for key derivation uniqueness
    - **Property 23: Encryption Key Derivation Uniqueness**
    - **Validates: Requirements 12.2**

- [ ] 4. Cache Manager and LocalStorage
  - [ ] 4.1 Implement CacheManager class
    - Implement getActivityCache() to read from LocalStorage
    - Implement saveActivityCache() to write to LocalStorage
    - Implement getWeekActivity(), getRepositories(), getCommits()
    - Implement updateWeekActivity(), addCommits()
    - Implement getCacheSize() and clearCache()
    - Implement isStale() for cache expiration logic
    - _Requirements: 2.5, 7.5, 7.6, 9.7, 12.5_
  
  - [ ]* 4.2 Write property test for cache round-trip
    - **Property 9: Cache Data Round-Trip**
    - **Validates: Requirements 2.5**
  
  - [ ]* 4.3 Write property test for cache size limit
    - **Property 15: Cache Size Limit**
    - **Validates: Requirements 11.5**
  
  - [ ]* 4.4 Write property test for cache staleness
    - **Property 18: Cache Staleness Check**
    - **Property 19: Current Week Cache Expiration**
    - **Validates: Requirements 7.5, 7.6**
  
  - [ ]* 4.5 Write unit tests for cache operations
    - Test clearCache removes all data
    - Test getCacheSize returns accurate size
    - Test error handling for storage quota exceeded

- [ ] 5. Calculation Utilities
  - [ ] 5.1 Implement calculation functions
    - Implement calculateRepoStatus() based on last commit date
    - Implement calculateStreak() from commit list
    - Implement aggregateWeekActivity() from commits
    - Implement getMostUsedLanguage() from repositories
    - _Requirements: 4.2-4.5, 16.1, 2.4, 3.5_
  
  - [ ]* 5.2 Write property test for repository status calculation
    - **Property 2: Repository Status Calculation**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5**
  
  - [ ]* 5.3 Write property test for streak calculation
    - **Property 4: Streak Calculation**
    - **Validates: Requirements 16.1, 16.2, 16.3**
  
  - [ ]* 5.4 Write property test for week activity aggregation
    - **Property 3: Week Activity Aggregation**
    - **Validates: Requirements 2.4**
  
  - [ ]* 5.5 Write property test for most used language
    - **Property 29: Most Used Language Calculation**
    - **Validates: Requirements 3.5**

- [ ] 6. GitHub API Service
  - [ ] 6.1 Implement GitHubAPI class
    - Implement getUserProfile() to fetch user data
    - Implement getRepositories() to fetch all repos
    - Implement getCommits() for a repository
    - Implement getCommitDetails() for specific commit
    - Implement checkRateLimit() to monitor API limits
    - Add error handling for 401, 403, 404 responses
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 2.3, 2.6_
  
  - [ ]* 6.2 Write unit tests for API error handling
    - Test 404 user not found error
    - Test 401 invalid token error
    - Test 403 rate limit error
    - Test network error handling
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 7. Zustand Stores
  - [ ] 7.1 Create auth-store
    - Define AuthState interface
    - Implement setCredentials() and clearCredentials()
    - Implement loadFromCache() to restore auth state
    - _Requirements: 1.1, 1.5_
  
  - [ ] 7.2 Create activity-store
    - Define ActivityState interface
    - Implement loadFromCache() to load activity data
    - Implement syncWithGitHub() to fetch new data
    - Implement addCommits() and updateRepository()
    - _Requirements: 2.5, 7.4_
  
  - [ ] 7.3 Create settings-store
    - Define SettingsState interface
    - Implement updateSettings() to save preferences
    - Implement loadFromCache() to restore settings
    - _Requirements: 9.3, 9.4, 9.5_

- [ ] 8. Authentication Page
  - [ ] 8.1 Create auth page UI
    - Create login form with username and token fields
    - Add explanation text about token usage
    - Add link to GitHub token creation docs
    - Style with shadcn/ui components
    - _Requirements: 1.1, 1.2, 1.6_
  
  - [ ] 8.2 Implement authentication logic
    - Handle form submission
    - Validate username format
    - Call GitHubAPI.getUserProfile()
    - Encrypt and store token using CryptoService
    - Store credentials in auth-store
    - Redirect to dashboard on success
    - Display error messages for failures
    - _Requirements: 1.1, 1.3, 1.4, 1.5_
  
  - [ ]* 8.3 Write unit tests for auth page
    - Test successful authentication flow
    - Test error display for invalid username
    - Test error display for invalid token
    - Test redirect after successful auth

- [ ] 9. Initial Data Loading
  - [ ] 9.1 Create loading screen component
    - Display progress bar with stages
    - Show loading messages: "Récupération de tes repos...", etc.
    - Animate progress from 0% to 100%
    - _Requirements: 2.1_
  
  - [ ] 9.2 Implement data fetching orchestration
    - Fetch user profile (20% progress)
    - Fetch all repositories (40% progress)
    - Fetch commits for last 6 months (60% progress)
    - Calculate week activities (80% progress)
    - Save to cache (100% progress)
    - Handle rate limit errors
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_
  
  - [ ]* 9.3 Write property test for commit date filtering
    - **Property 10: Commit Date Filtering**
    - **Validates: Requirements 2.3**
  
  - [ ]* 9.4 Write unit tests for loading flow
    - Test progress updates correctly
    - Test rate limit error handling
    - Test cache save after loading

- [ ] 10. Dashboard Layout and Navigation
  - [ ] 10.1 Create main layout with sidebars
    - Create Sidebar component with navigation links
    - Create Header component with user profile
    - Create StatsPanel component for right sidebar
    - Implement responsive behavior (desktop/tablet/mobile)
    - _Requirements: 3.1, 14.1, 14.2, 14.3_
  
  - [ ]* 10.2 Write unit tests for responsive layout
    - Test desktop layout (> 1024px)
    - Test tablet layout (768-1024px)
    - Test mobile layout (< 768px)

- [ ] 11. Dashboard - Today and This Week Sections
  - [ ] 11.1 Create TodayCard component
    - Display today's commit count
    - Display active projects list
    - Display last commit time and message
    - Add "Voir détails du jour" button
    - _Requirements: 3.1_
  
  - [ ] 11.2 Create WeekSummary component
    - Display total commits for current week
    - Create ActivityBarChart for daily commits
    - Display top 3 most active projects
    - _Requirements: 3.2_
  
  - [ ]* 11.3 Write unit tests for dashboard components
    - Test TodayCard displays correct data
    - Test WeekSummary displays correct data
    - Test ActivityBarChart renders with data

- [ ] 12. Dashboard - Week Timeline
  - [ ] 12.1 Create WeekCard component
    - Display week date range
    - Display mini activity graph (7 bars)
    - Display total commits badge
    - Display list of touched projects
    - Add "Voir détails" button
    - _Requirements: 3.3, 3.4_
  
  - [ ] 12.2 Create WeekTimeline component
    - Render last 12 WeekCard components
    - Implement scrollable container
    - Handle click to open modal with details
    - _Requirements: 3.3, 3.7_
  
  - [ ]* 12.3 Write property test for week card content
    - **Property 26: Week Card Content Completeness**
    - **Validates: Requirements 3.4**
  
  - [ ]* 12.4 Write unit tests for week timeline
    - Test correct number of weeks displayed
    - Test modal opens on card click
    - Test scrolling behavior

- [ ] 13. Dashboard - Statistics Panel
  - [ ] 13.1 Create StatsPanel component
    - Display total projects count
    - Display total commits count
    - Display most active project
    - Display most used language
    - Display current streak
    - Create HeatmapCalendar component for current month
    - _Requirements: 3.5, 3.6_
  
  - [ ]* 13.2 Write property test for dashboard statistics
    - **Property 32: Dashboard Statistics Calculation**
    - **Validates: Requirements 3.5**

- [ ] 14. Checkpoint - Core Dashboard Complete
  - Ensure all tests pass
  - Verify dashboard displays correctly with sample data
  - Test authentication flow end-to-end
  - Ask the user if questions arise

- [ ] 15. Projects Page - Repository List
  - [ ] 15.1 Create ProjectCard component
    - Display repository name with GitHub link
    - Display status badge with color
    - Display language with icon
    - Display description (truncated)
    - Display last activity date (relative format)
    - Display last commit message (truncated)
    - Display mini 30-day activity graph
    - Display stats: commits, stars, forks
    - Add "Voir historique complet" button
    - _Requirements: 4.9_
  
  - [ ] 15.2 Create ProjectFilters component
    - Add search bar for filtering by name
    - Add status dropdown filter
    - Add language dropdown filter
    - Add sort dropdown (last activity, name, stars, commits)
    - _Requirements: 4.6, 4.7, 4.8_
  
  - [ ] 15.3 Create projects page
    - Render ProjectFilters at top
    - Render grid of ProjectCard components
    - Implement filtering logic
    - Implement sorting logic
    - Limit display to 100 repositories
    - _Requirements: 4.1, 11.6_
  
  - [ ]* 15.4 Write property test for repository filtering
    - **Property 5: Repository Filtering**
    - **Property 6: Language Filtering**
    - **Validates: Requirements 4.6, 4.7**
  
  - [ ]* 15.5 Write property test for search filtering
    - **Property 7: Search Query Matching**
    - **Validates: Requirements 4.8**
  
  - [ ]* 15.6 Write property test for repository card content
    - **Property 25: Repository Card Content Completeness**
    - **Validates: Requirements 4.9**
  
  - [ ]* 15.7 Write property test for display limit
    - **Property 16: Repository Display Limit**
    - **Validates: Requirements 11.6**


- [ ] 16. Projects Page - Repository Details Modal
  - [ ] 16.1 Create ProjectModal component
    - Create modal with tabs: Activité, Statistiques, Timeline
    - Implement Activité tab with detailed graph and commit list
    - Implement Statistiques tab with totals and distributions
    - Implement Timeline tab with calendar view
    - Add "Ouvrir sur GitHub" button
    - Add "Archiver" button
    - _Requirements: 5.1, 5.2, 5.6, 5.7_
  
  - [ ] 16.2 Implement commit grouping by week
    - Group commits by week in reverse chronological order
    - Display each commit with date, time, message, files
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 16.3 Write property test for commit grouping
    - **Property 20: Commit Grouping by Week**
    - **Validates: Requirements 5.3**
  
  - [ ]* 16.4 Write property test for commit display content
    - **Property 27: Commit Display Content Completeness**
    - **Validates: Requirements 5.4**
  
  - [ ]* 16.5 Write unit tests for project modal
    - Test modal opens and closes
    - Test tab switching
    - Test GitHub link is correct
    - Test archive button functionality

- [ ] 17. Search Page - Search Bar and Filters
  - [ ] 17.1 Create SearchBar component
    - Create large search input with placeholder
    - Implement real-time search (debounced 300ms)
    - Add loading indicator during search
    - _Requirements: 6.1_
  
  - [ ] 17.2 Create SearchFilters component
    - Add date range filter (today, this week, this month, custom)
    - Add project multi-select dropdown
    - Add language dropdown
    - Add type filter (commits, issues, PRs, repos)
    - Add content filter (files, messages, code)
    - _Requirements: 6.4_
  
  - [ ] 17.3 Implement search logic
    - Search across commits, repositories, files
    - Search in messages, filenames, repo names, descriptions
    - Apply all active filters
    - Sort by relevance then date
    - Limit to last 12 months
    - _Requirements: 6.1, 6.2, 6.6, 11.7_
  
  - [ ]* 17.4 Write property test for search matching
    - **Property 7: Search Query Matching**
    - **Validates: Requirements 6.1, 6.2**
  
  - [ ]* 17.5 Write property test for search result sorting
    - **Property 8: Search Result Sorting**
    - **Validates: Requirements 6.6**
  
  - [ ]* 17.6 Write property test for multi-filter application
    - **Property 22: Search Multi-Filter Application**
    - **Validates: Requirements 6.4**
  
  - [ ]* 17.7 Write property test for search date limit
    - **Property 10: Commit Date Filtering**
    - **Validates: Requirements 11.7**

- [ ] 18. Search Page - Search Results
  - [ ] 18.1 Create SearchResults component
    - Display result count
    - Add sort dropdown (relevance, date, project)
    - Render list of result cards
    - Show result type icon
    - Show title/message
    - Show project name badge
    - Show date and time
    - Show context (files changed, status, etc.)
    - Add "Voir sur GitHub" button
    - Add "Voir contexte" button
    - _Requirements: 6.3, 6.5_
  
  - [ ] 18.2 Create empty search state
    - Display "Dernières recherches" suggestions
    - Display quick shortcuts
    - _Requirements: 6.7_
  
  - [ ]* 18.3 Write property test for search result content
    - **Property 28: Search Result Content Completeness**
    - **Validates: Requirements 6.3**
  
  - [ ]* 18.4 Write unit tests for search results
    - Test empty state displays correctly
    - Test result cards render correctly
    - Test GitHub links are correct

- [ ] 19. Data Synchronization
  - [ ] 19.1 Implement sync logic
    - Check last sync date from cache
    - Fetch only commits since last sync
    - Update affected week activities
    - Recalculate statistics
    - Update cache with new data
    - _Requirements: 7.4, 16.5_
  
  - [ ] 19.2 Create useSync hook
    - Implement sync() function
    - Track isSyncing state
    - Track lastSync timestamp
    - Handle errors during sync
    - _Requirements: 7.4, 7.7, 7.8_
  
  - [ ] 19.3 Add sync UI elements
    - Add refresh button to header
    - Show loading animation during sync
    - Display success toast after sync
    - Display error message on failure
    - Show notification badge for new activity
    - _Requirements: 7.3, 7.7, 7.8_
  
  - [ ]* 19.4 Write property test for incremental sync
    - **Property 17: Incremental Sync**
    - **Validates: Requirements 7.4**
  
  - [ ]* 19.5 Write property test for streak update after sync
    - **Property 34: Streak Update After Sync**
    - **Validates: Requirements 16.5**
  
  - [ ]* 19.6 Write unit tests for sync
    - Test sync fetches only new data
    - Test sync updates cache correctly
    - Test sync error handling
    - Test notification badge appears

- [ ] 20. Checkpoint - Core Features Complete
  - Ensure all tests pass
  - Test full user flow: auth → dashboard → projects → search → sync
  - Verify all data displays correctly
  - Test error handling scenarios
  - Ask the user if questions arise

- [ ] 21. Report Generation
  - [ ] 21.1 Implement report generation functions
    - Implement generateWeeklyReport() to create Markdown
    - Implement generateMonthlyReport() with aggregation
    - Include all required sections: overview, projects, highlights, daily breakdown
    - Format as valid Markdown with proper headers and lists
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [ ] 21.2 Create report UI
    - Add "Générer rapport" buttons to dashboard
    - Create date range picker for custom reports
    - Add "Copier en Markdown" button
    - Add "Télécharger .md" button
    - Display generated report in modal
    - _Requirements: 8.4, 8.5_
  
  - [ ]* 21.3 Write property test for weekly report generation
    - **Property 11: Weekly Report Generation**
    - **Validates: Requirements 8.1, 8.2**
  
  - [ ]* 21.4 Write property test for monthly report aggregation
    - **Property 12: Monthly Report Aggregation**
    - **Validates: Requirements 8.3**
  
  - [ ]* 21.5 Write unit tests for report UI
    - Test report modal opens
    - Test copy to clipboard works
    - Test download creates file
    - Test custom date range selection

- [ ] 22. Settings Page
  - [ ] 22.1 Create settings page UI
    - Create "Connexion GitHub" section with account info
    - Create "Préférences d'affichage" section
    - Create "Export" section
    - Create "Cache et données" section
    - Create "Danger Zone" section
    - Style with shadcn/ui components
    - _Requirements: 9.1-9.8_
  
  - [ ] 22.2 Implement settings functionality
    - Implement account switching
    - Implement token renewal
    - Implement date format selection
    - Implement theme switching
    - Implement weeks display configuration
    - Implement data export to JSON
    - Implement cache clearing
    - Display cache size and last sync date
    - _Requirements: 9.1-9.8_
  
  - [ ]* 22.3 Write property test for date format consistency
    - **Property 21: Date Format Consistency**
    - **Validates: Requirements 9.3**
  
  - [ ]* 22.4 Write property test for weeks display configuration
    - **Property 33: Weeks Display Configuration**
    - **Validates: Requirements 9.5**
  
  - [ ]* 22.5 Write property test for data export
    - **Property 13: Data Export Completeness**
    - **Property 14: JSON Export Round-Trip**
    - **Validates: Requirements 9.6, 15.1, 15.2**
  
  - [ ]* 22.6 Write unit tests for settings
    - Test theme switching works
    - Test account switching clears old data
    - Test cache clear removes all data
    - Test export generates valid JSON

- [ ] 23. Offline Mode
  - [ ] 23.1 Create useOfflineMode hook
    - Detect online/offline status
    - Listen to online/offline events
    - Return isOnline and isOffline states
    - _Requirements: 10.1_
  
  - [ ] 23.2 Implement offline mode UI
    - Display offline banner when offline
    - Disable refresh button when offline
    - Show cache date in banner
    - Add manual offline toggle in settings
    - Show sync prompt when coming back online
    - _Requirements: 10.2, 10.3, 10.5, 10.6_
  
  - [ ] 23.3 Ensure offline functionality
    - Verify all navigation works with cached data
    - Prevent API calls when offline
    - Load all data from cache
    - _Requirements: 10.4_
  
  - [ ]* 23.4 Write property test for offline data access
    - **Property 30: Offline Mode Data Access**
    - **Validates: Requirements 10.4**
  
  - [ ]* 23.5 Write unit tests for offline mode
    - Test offline banner appears when offline
    - Test refresh button is disabled when offline
    - Test manual toggle works
    - Test sync prompt appears when back online

- [ ] 24. Data Deletion and Privacy
  - [ ] 24.1 Implement data deletion
    - Add "Supprimer toutes mes données" button
    - Show confirmation dialog with warning
    - Clear all LocalStorage keys starting with "github-tracker-"
    - Clear all Zustand stores
    - Redirect to auth page after deletion
    - _Requirements: 12.7, 12.8_
  
  - [ ]* 24.2 Write property test for data deletion
    - **Property 24: Data Deletion Completeness**
    - **Validates: Requirements 12.7, 12.8**
  
  - [ ]* 24.3 Write unit tests for data deletion
    - Test confirmation dialog appears
    - Test all data is removed after deletion
    - Test redirect to auth page

- [ ] 25. Error Handling and Edge Cases
  - [ ] 25.1 Implement error boundaries
    - Create ErrorBoundary component
    - Display user-friendly error messages
    - Provide retry and reset options
    - Log errors to console
    - _Requirements: 13.5, 13.6_
  
  - [ ] 25.2 Handle edge cases
    - New GitHub account with no activity
    - Account with 100+ repositories
    - No recent commits
    - Deleted repositories
    - _Requirements: Various edge cases from specs_
  
  - [ ]* 25.3 Write unit tests for error handling
    - Test network error displays correctly
    - Test token expiry error redirects
    - Test rate limit error displays countdown
    - Test username not found error
    - Test error boundary catches errors

- [ ] 26. Performance Optimization
  - [ ] 26.1 Implement performance optimizations
    - Add React.memo to expensive components
    - Implement virtual scrolling for long lists (react-window)
    - Add code splitting for routes
    - Lazy load chart libraries
    - Optimize images with Next.js Image
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ] 26.2 Add loading states
    - Implement skeleton screens for all pages
    - Add loading spinners for async operations
    - Show progress indicators where appropriate
    - _Requirements: 11.1_
  
  - [ ]* 26.3 Test performance
    - Verify initial load time
    - Test with large datasets (100 repos, 1000+ commits)
    - Check bundle size

- [ ] 27. Accessibility and Responsive Design
  - [ ] 27.1 Ensure accessibility
    - Add proper ARIA labels
    - Ensure keyboard navigation works
    - Test with screen readers
    - Verify color contrast ratios
    - Add focus indicators
  
  - [ ] 27.2 Test responsive design
    - Test on desktop (> 1024px)
    - Test on tablet (768-1024px)
    - Test on mobile (< 768px)
    - Verify touch gestures work on mobile
    - Test graph simplification on mobile
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

- [ ] 28. Final Integration and Polish
  - [ ] 28.1 Integration testing
    - Test complete user flows end-to-end
    - Test authentication → data loading → dashboard → projects → search → settings
    - Test sync and offline mode
    - Test report generation and export
    - Test error recovery scenarios
  
  - [ ] 28.2 UI polish
    - Add smooth transitions and animations
    - Refine spacing and typography
    - Ensure consistent styling across pages
    - Add loading states and empty states
    - Improve error messages
  
  - [ ] 28.3 Documentation
    - Write README with setup instructions
    - Document environment variables
    - Add inline code comments
    - Create user guide (optional)

- [ ] 29. Final Checkpoint - MVP Complete
  - Run full test suite (unit + property tests)
  - Verify all requirements are met
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Test on multiple devices (desktop, tablet, mobile)
  - Check bundle size and performance
  - Verify security (CSP headers, token encryption)
  - Ask the user for final review and feedback

## Notes

- Tasks marked with `*` are optional test tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and user feedback
- Property tests validate universal correctness properties across many inputs
- Unit tests validate specific examples, edge cases, and UI behavior
- The plan prioritizes MVP features first, then adds advanced features progressively
- Each task builds on previous work, ensuring the application remains functional at every stage
