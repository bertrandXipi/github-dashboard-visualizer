# Requirements Document

## Introduction

Cette extension du GitHub Activity Tracker ajoute des fonctionnalités d'organisation et de productivité pour permettre aux développeurs de mieux gérer leurs projets. Elle introduit un système de tags personnalisés, de notes, de TODO lists par projet, et de statuts manuels. L'ensemble est synchronisé via Supabase pour permettre une utilisation multi-machines cohérente.

## Glossary

- **System**: Le GitHub Activity Tracker avec les extensions d'organisation
- **User**: Le développeur qui utilise l'application
- **Project**: Un repository GitHub avec ses métadonnées d'organisation
- **Tag**: Une étiquette personnalisée assignable aux projets (ex: "client", "perso")
- **Note**: Un texte libre associé à un projet pour capturer des informations contextuelles
- **TODO_Item**: Une tâche à faire associée à un projet
- **Manual_Status**: Le statut défini par l'utilisateur (en cours, en pause, terminé, abandonné)
- **Clone_Status**: L'état indiquant si un projet est cloné sur la machine actuelle
- **Supabase**: Le service backend utilisé pour la synchronisation multi-machines
- **Machine_ID**: Un identifiant unique généré pour chaque machine/navigateur

## Requirements

### Requirement 1: Gestion des Tags Personnalisés

**User Story:** As a user, I want to create and assign custom tags to my projects, so that I can categorize and filter them according to my workflow.

#### Acceptance Criteria

1. THE System SHALL allow the user to create custom tags with a name and a color
2. WHEN a user creates a tag, THE System SHALL validate that the tag name is unique and non-empty
3. THE System SHALL allow the user to assign multiple tags to a single project
4. THE System SHALL allow the user to remove tags from a project
5. WHEN displaying a project card, THE System SHALL show all assigned tags as colored badges
6. THE System SHALL provide a filter to display only projects with specific tags
7. THE System SHALL allow the user to edit tag name and color
8. THE System SHALL allow the user to delete a tag, removing it from all associated projects
9. THE System SHALL provide default tags: "client", "perso", "side-project", "à finir"

### Requirement 2: Projets Favoris et Épinglés

**User Story:** As a user, I want to mark projects as favorites and pin them, so that I can quickly access my most important projects.

#### Acceptance Criteria

1. THE System SHALL allow the user to mark a project as favorite
2. THE System SHALL allow the user to unmark a project as favorite
3. THE System SHALL allow the user to pin a project to the top of the list
4. THE System SHALL allow the user to unpin a project
5. WHEN displaying the project list, THE System SHALL show pinned projects first, then favorites, then others
6. WHEN displaying a project card, THE System SHALL show a star icon for favorites and a pin icon for pinned projects
7. THE System SHALL provide a filter to display only favorite projects
8. THE System SHALL limit the number of pinned projects to 5 maximum

### Requirement 3: Notes Personnelles par Projet

**User Story:** As a user, I want to add personal notes to my projects, so that I can capture context and important information.

#### Acceptance Criteria

1. THE System SHALL allow the user to add a text note to any project
2. THE System SHALL support Markdown formatting in notes
3. WHEN a user edits a note, THE System SHALL auto-save after 2 seconds of inactivity
4. THE System SHALL display a note indicator on project cards that have notes
5. WHEN the user clicks on a project, THE System SHALL display the note in the project modal
6. THE System SHALL allow the user to delete a note
7. THE System SHALL limit note length to 10,000 characters
8. THE System SHALL display the last modification date of the note

### Requirement 4: TODO List par Projet

**User Story:** As a user, I want to maintain a TODO list for each project, so that I can track what needs to be done.

#### Acceptance Criteria

1. THE System SHALL allow the user to add TODO items to any project
2. WHEN a user adds a TODO item, THE System SHALL require a non-empty description
3. THE System SHALL allow the user to mark a TODO item as completed
4. THE System SHALL allow the user to unmark a completed TODO item
5. THE System SHALL allow the user to delete a TODO item
6. THE System SHALL allow the user to reorder TODO items via drag and drop
7. WHEN displaying a project card, THE System SHALL show the count of incomplete TODO items
8. THE System SHALL display completed items at the bottom of the list with strikethrough styling
9. THE System SHALL allow the user to clear all completed TODO items at once
10. THE System SHALL limit the number of TODO items per project to 50

### Requirement 5: Statut Manuel des Projets

**User Story:** As a user, I want to set a manual status for my projects, so that I can track their lifecycle independently of GitHub activity.

#### Acceptance Criteria

1. THE System SHALL provide manual status options: "En cours", "En pause", "Terminé", "Abandonné"
2. THE System SHALL allow the user to set a manual status for any project
3. THE System SHALL allow the user to clear the manual status (return to automatic status based on activity)
4. WHEN a manual status is set, THE System SHALL display it instead of the automatic activity status
5. WHEN displaying a project card, THE System SHALL show the manual status with a distinct visual style
6. THE System SHALL provide a filter to display projects by manual status
7. THE System SHALL track the date when the manual status was last changed

### Requirement 6: Synchronisation Multi-Machines via Supabase

**User Story:** As a user, I want my organization data to sync across all my devices, so that I can access my tags, notes, and TODOs from any machine.

#### Acceptance Criteria

1. THE System SHALL generate a unique Machine_ID for each browser/device
2. THE System SHALL store the Machine_ID in LocalStorage
3. WHEN the user is authenticated with Supabase, THE System SHALL sync organization data to the cloud
4. THE System SHALL sync the following data: tags, project tags assignments, notes, TODO items, favorites, pins, manual statuses
5. WHEN organization data changes locally, THE System SHALL sync to Supabase within 5 seconds
6. WHEN the application opens, THE System SHALL fetch the latest organization data from Supabase
7. IF a sync conflict occurs, THEN THE System SHALL use the most recent modification timestamp to resolve it
8. IF Supabase is unavailable, THEN THE System SHALL queue changes and sync when connection is restored
9. THE System SHALL display a sync status indicator showing last sync time

### Requirement 7: Détection du Clone Local

**User Story:** As a user, I want to know which projects are cloned on my current machine, so that I can quickly identify projects I can work on locally.

#### Acceptance Criteria

1. THE System SHALL allow the user to mark a project as "cloned on this machine"
2. THE System SHALL store clone status per Machine_ID
3. WHEN displaying a project card, THE System SHALL show a "local" badge if the project is cloned on the current machine
4. THE System SHALL provide a filter to display only projects cloned on the current machine
5. THE System SHALL provide a filter to display only projects NOT cloned on the current machine
6. THE System SHALL sync clone status to Supabase with Machine_ID association
7. WHEN viewing project details, THE System SHALL show on which machines the project is cloned

### Requirement 8: Interface Utilisateur pour l'Organisation

**User Story:** As a user, I want an intuitive interface to manage my project organization, so that I can efficiently use all organization features.

#### Acceptance Criteria

1. THE System SHALL add a "Tags" management section in settings
2. THE System SHALL add organization controls (tags, favorite, pin, status) to the project card
3. THE System SHALL add a notes and TODO section to the project modal
4. THE System SHALL add organization filters to the project list filters
5. WHEN the user hovers over a project card, THE System SHALL show quick action buttons for favorite and pin
6. THE System SHALL provide keyboard shortcuts for common actions (favorite: F, pin: P)
7. THE System SHALL display a summary of organization data on the dashboard (pinned projects, incomplete TODOs count)

### Requirement 9: Migration et Compatibilité

**User Story:** As a user, I want my existing data to be preserved when upgrading, so that I don't lose any information.

#### Acceptance Criteria

1. WHEN the application updates, THE System SHALL migrate existing LocalStorage data to the new schema
2. THE System SHALL preserve all existing cached GitHub data during migration
3. THE System SHALL initialize organization data with default values for existing projects
4. IF migration fails, THEN THE System SHALL display an error and offer to reset or retry
5. THE System SHALL log migration progress and any errors to the console

### Requirement 10: Performance et Limites

**User Story:** As a system, I want to maintain performance with organization data, so that the user experience remains fast.

#### Acceptance Criteria

1. THE System SHALL limit total tags to 50 per user
2. THE System SHALL limit total TODO items across all projects to 500
3. THE System SHALL limit total notes size to 1 MB
4. THE System SHALL batch Supabase sync operations to minimize API calls
5. THE System SHALL cache organization data locally for offline access
6. THE System SHALL complete organization data operations within 100ms locally

