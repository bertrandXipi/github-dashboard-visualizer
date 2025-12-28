# Requirements Document

## Introduction

Le GitHub Activity Tracker est un dashboard web qui archive automatiquement l'activité GitHub d'un développeur et permet de naviguer dans son historique de développement comme dans un journal. L'application résout le problème de la perte de contexte sur les projets passés en offrant une vue chronologique et recherchable de toute l'activité de développement.

## Glossary

- **System**: Le GitHub Activity Tracker (l'application web complète)
- **User**: Le développeur qui utilise l'application pour suivre son activité GitHub
- **GitHub_API**: L'API REST de GitHub utilisée pour récupérer les données
- **Activity_Data**: L'ensemble des commits, repositories, et événements GitHub d'un utilisateur
- **Week_Card**: Une carte visuelle représentant l'activité d'une semaine spécifique
- **Repository_Status**: L'état d'activité d'un repository (Actif, Tiède, Froid, Archivé)
- **Cache**: Le stockage local (LocalStorage) contenant les données GitHub
- **Token**: Le Personal Access Token GitHub utilisé pour l'authentification
- **Commit**: Une modification de code enregistrée dans Git
- **Streak**: Le nombre de jours consécutifs avec au moins un commit
- **Sync**: L'opération de récupération des nouvelles données depuis GitHub

## Requirements

### Requirement 1: Authentification GitHub

**User Story:** As a user, I want to connect my GitHub account, so that I can view my activity data.

#### Acceptance Criteria

1. WHEN a user provides a valid GitHub username, THE System SHALL authenticate and retrieve the user profile
2. WHERE a GitHub token is provided, THE System SHALL use it to access private repositories
3. IF the username does not exist, THEN THE System SHALL display an error message and prompt for correction
4. IF the token is invalid or expired, THEN THE System SHALL display a specific error message and redirect to settings
5. WHEN authentication succeeds, THE System SHALL store the credentials securely in encrypted local storage
6. THE System SHALL provide a link to GitHub token creation documentation

### Requirement 2: Initial Data Loading

**User Story:** As a user, I want my GitHub data to be loaded on first use, so that I can start tracking my activity.

#### Acceptance Criteria

1. WHEN the user authenticates for the first time, THE System SHALL display a progress indicator showing loading stages
2. THE System SHALL retrieve all user repositories from GitHub_API
3. THE System SHALL retrieve commit history for the last 6 months
4. THE System SHALL calculate and store activity statistics for each week
5. WHEN data loading completes, THE System SHALL cache all retrieved data in local storage
6. IF the GitHub_API rate limit is reached, THEN THE System SHALL display the remaining time and offer cache-only mode
7. THE System SHALL complete initial loading within 30 seconds for accounts with up to 100 repositories

### Requirement 3: Dashboard Display

**User Story:** As a user, I want to see my recent activity at a glance, so that I can quickly understand what I've been working on.

#### Acceptance Criteria

1. WHEN the dashboard loads, THE System SHALL display today's commit count and active projects
2. THE System SHALL display the current week's activity with a daily bar chart
3. THE System SHALL display the last 12 weeks as scrollable cards
4. WHEN displaying a Week_Card, THE System SHALL show dates, mini activity graph, total commits, and project list
5. THE System SHALL display global statistics including total projects, total commits, most active project, and current streak
6. THE System SHALL display a heatmap calendar for the current month
7. WHEN the user clicks on a Week_Card, THE System SHALL open a modal with detailed week information

### Requirement 4: Repository Management

**User Story:** As a user, I want to view and filter my repositories, so that I can focus on specific projects.

#### Acceptance Criteria

1. THE System SHALL display all user repositories in a grid layout
2. WHEN a repository has had a commit within 7 days, THE System SHALL mark it as Actif with a green badge
3. WHEN a repository has had a commit between 7-30 days ago, THE System SHALL mark it as Tiède with a yellow badge
4. WHEN a repository has had a commit more than 30 days ago, THE System SHALL mark it as Froid with a blue badge
5. WHEN a repository has had no commit for more than 90 days, THE System SHALL mark it as Archivé with a gray badge
6. WHEN the user applies a status filter, THE System SHALL display only repositories matching that status
7. WHEN the user applies a language filter, THE System SHALL display only repositories using that language
8. WHEN the user searches by name, THE System SHALL filter repositories in real-time
9. WHEN displaying a repository card, THE System SHALL show name, status badge, language, description, last activity date, last commit message, 30-day activity graph, and statistics

### Requirement 5: Repository Details

**User Story:** As a user, I want to see detailed information about a specific repository, so that I can review its complete history.

#### Acceptance Criteria

1. WHEN the user clicks on a repository card, THE System SHALL open a modal with detailed information
2. THE System SHALL display a detailed 30-day activity graph for the repository
3. THE System SHALL display commits grouped by week in reverse chronological order
4. WHEN displaying a commit, THE System SHALL show date, time, message, and files changed
5. THE System SHALL provide a button to open the repository on GitHub
6. THE System SHALL calculate and display total commits, lines added, lines deleted, and file type distribution
7. THE System SHALL provide a calendar timeline view showing days with and without activity

### Requirement 6: Search Functionality

**User Story:** As a user, I want to search through my activity history, so that I can quickly find specific commits or projects.

#### Acceptance Criteria

1. WHEN the user types in the search bar, THE System SHALL perform real-time search across commits, repositories, and files
2. THE System SHALL search in commit messages, file names, repository names, and descriptions
3. WHEN displaying search results, THE System SHALL show result type, title, project name, date, and context
4. THE System SHALL allow filtering by date range, project, language, and content type
5. WHEN the user clicks on a search result, THE System SHALL provide options to view on GitHub or view context
6. THE System SHALL sort results by relevance (occurrence count) then by date
7. WHEN no results are found, THE System SHALL display recent searches and quick shortcuts

### Requirement 7: Data Synchronization

**User Story:** As a user, I want my data to stay up-to-date, so that I always see my latest activity.

#### Acceptance Criteria

1. WHEN the application opens, THE System SHALL load data from cache within 1 second
2. WHILE the application is open, THE System SHALL check for new data in the background
3. WHEN new activity is detected, THE System SHALL display a notification badge
4. WHEN the user clicks the refresh button, THE System SHALL fetch only recent data from GitHub_API
5. THE System SHALL cache the current week for 1 hour
6. THE System SHALL cache past weeks permanently
7. WHEN synchronization completes, THE System SHALL display a success toast notification
8. IF network connection fails, THEN THE System SHALL display an error message and offer cache-only mode

### Requirement 8: Report Generation

**User Story:** As a user, I want to generate activity reports, so that I can share my work progress.

#### Acceptance Criteria

1. WHEN the user requests a weekly report, THE System SHALL generate a Markdown document with activity summary
2. THE System SHALL include in the report: total commits, projects touched, lines added/deleted, daily breakdown, and highlights
3. WHEN the user requests a monthly report, THE System SHALL aggregate data by week and include month-over-month comparison
4. THE System SHALL provide options to copy the report to clipboard or download as a .md file
5. THE System SHALL allow custom date range selection for reports
6. WHEN generating a report, THE System SHALL complete within 2 seconds

### Requirement 9: Settings and Preferences

**User Story:** As a user, I want to customize the application, so that it fits my workflow.

#### Acceptance Criteria

1. THE System SHALL allow the user to change the connected GitHub account
2. THE System SHALL allow the user to renew or update the GitHub token
3. THE System SHALL provide options for date format (EU, US, Relative)
4. THE System SHALL provide theme options (Light, Dark, Auto)
5. THE System SHALL allow the user to configure the number of weeks to display (4-24)
6. THE System SHALL provide options to export all data as JSON
7. THE System SHALL provide an option to clear the cache with a warning message
8. THE System SHALL display cache size and last sync date

### Requirement 10: Offline Mode

**User Story:** As a user, I want to use the application without internet, so that I can review my past activity anywhere.

#### Acceptance Criteria

1. WHEN network connection is unavailable, THE System SHALL automatically switch to offline mode
2. WHILE in offline mode, THE System SHALL display a banner indicating offline status and cache date
3. WHILE in offline mode, THE System SHALL disable the refresh button
4. WHILE in offline mode, THE System SHALL allow full navigation of cached data
5. THE System SHALL provide a manual toggle for offline mode in settings
6. WHEN connection is restored, THE System SHALL offer to synchronize new data

### Requirement 11: Performance Optimization

**User Story:** As a system, I want to load data efficiently, so that the user experience is fast and smooth.

#### Acceptance Criteria

1. THE System SHALL display skeleton screens while loading data
2. THE System SHALL load the current week immediately upon opening
3. THE System SHALL load the last 4 weeks progressively
4. THE System SHALL load older weeks on demand when scrolling
5. THE System SHALL limit cache size to 50 MB maximum
6. THE System SHALL limit displayed repositories to 100 simultaneously
7. THE System SHALL limit search scope to the last 12 months
8. THE System SHALL batch API requests to minimize calls to GitHub_API
9. THE System SHALL use GitHub ETags to detect data changes efficiently

### Requirement 12: Security and Privacy

**User Story:** As a user, I want my data to be secure, so that my GitHub credentials are protected.

#### Acceptance Criteria

1. WHEN storing the GitHub token, THE System SHALL encrypt it using Web Crypto API
2. THE System SHALL derive the encryption key from a unique salt
3. THE System SHALL never transmit the token to any server other than api.github.com
4. THE System SHALL never display the token in logs or console
5. THE System SHALL store all user data exclusively in browser LocalStorage
6. THE System SHALL not use any analytics tracking or cookies
7. THE System SHALL provide a button to completely delete all stored data
8. WHEN the user requests data deletion, THE System SHALL remove all data from LocalStorage and display a confirmation

### Requirement 13: Error Handling

**User Story:** As a user, I want clear error messages, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. IF network connection fails, THEN THE System SHALL display a message offering cache mode or retry options
2. IF the GitHub token expires, THEN THE System SHALL display a specific message and redirect to settings
3. IF the GitHub_API rate limit is reached, THEN THE System SHALL display remaining time and offer cache-only mode
4. IF a username is not found, THEN THE System SHALL display an error and allow correction
5. IF data loading fails, THEN THE System SHALL display the specific error and offer retry or support options
6. THE System SHALL log errors to browser console for debugging purposes

### Requirement 14: Responsive Design

**User Story:** As a user, I want to use the application on any device, so that I can check my activity on mobile or tablet.

#### Acceptance Criteria

1. WHEN the viewport width is greater than 1024px, THE System SHALL display fixed left and right sidebars with a 3-column card grid
2. WHEN the viewport width is between 768-1024px, THE System SHALL display a collapsible left sidebar and a 2-column card grid
3. WHEN the viewport width is less than 768px, THE System SHALL display a bottom navigation bar and a 1-column card layout
4. WHEN on mobile, THE System SHALL support touch gestures for navigation
5. WHEN on mobile, THE System SHALL simplify graphs for better readability
6. THE System SHALL maintain full functionality across all screen sizes

### Requirement 15: Data Export

**User Story:** As a user, I want to export my data, so that I have a backup and can use it elsewhere.

#### Acceptance Criteria

1. WHEN the user requests a data export, THE System SHALL generate a JSON file containing all cached data
2. THE System SHALL include in the export: user profile, repositories, commits, weeks activity, and cache metadata
3. THE System SHALL provide a download button for the JSON file
4. THE System SHALL format the JSON file to be human-readable
5. WHEN export completes, THE System SHALL display a success message with file size

### Requirement 16: Streak Calculation

**User Story:** As a user, I want to see my commit streak, so that I can stay motivated to code daily.

#### Acceptance Criteria

1. THE System SHALL calculate the current streak by counting consecutive days with at least one commit
2. WHEN calculating the streak, THE System SHALL start from today and count backwards
3. WHEN a day has no commits, THE System SHALL stop the streak count
4. THE System SHALL display the current streak on the dashboard
5. THE System SHALL update the streak calculation after each data synchronization
