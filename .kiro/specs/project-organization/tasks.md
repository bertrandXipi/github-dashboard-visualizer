# Implementation Plan: Project Organization

## Overview

Ce plan d'implémentation ajoute les fonctionnalités d'organisation et de productivité au GitHub Activity Tracker. L'approche est incrémentale : on commence par les types et le cache local, puis le store Zustand, ensuite les composants UI, et enfin la synchronisation Supabase.

Tout le développement se fait sur une branche feature dédiée `feature/project-organization`.

## Tasks

- [x] 1. Setup de la branche feature
  - Créer la branche `feature/project-organization` depuis `main`
  - Vérifier que le projet compile et que les tests passent
  - _Prérequis pour tout le développement_

- [x] 2. Types et Interfaces
  - [x] 2.1 Créer les types d'organisation
    - Créer `src/types/organization.ts`
    - Définir Tag, TodoItem, ProjectNote, ProjectOrganization
    - Définir ManualStatus, MachineInfo, SyncQueueItem
    - Définir OrganizationData et ORGANIZATION_LIMITS
    - Exporter depuis `src/types/index.ts`
    - _Requirements: 1.1, 4.1, 5.1, 6.1, 10.1-10.3_

- [x] 3. Cache LocalStorage pour Organisation
  - [x] 3.1 Implémenter le cache d'organisation
    - Créer `src/lib/storage/organization-cache.ts`
    - Implémenter getTags(), saveTags()
    - Implémenter getProjectOrganizations(), saveProjectOrganizations()
    - Implémenter getNotes(), saveNotes()
    - Implémenter getTodos(), saveTodos()
    - Implémenter getMachineInfo(), saveMachineInfo(), getOrCreateMachineId()
    - Implémenter getSyncQueue(), saveSyncQueue(), addToSyncQueue()
    - _Requirements: 6.2, 6.8_
  
  - [ ]* 3.2 Écrire les tests property pour le cache
    - **Property 1: Tag Data Round-Trip**
    - **Property 9: Note Data Round-Trip**
    - **Property 11: TODO Data Round-Trip**
    - **Validates: Requirements 1.1, 3.1, 4.1**

- [x] 4. Utilitaires d'Organisation
  - [x] 4.1 Implémenter les fonctions utilitaires
    - Créer `src/lib/utils/organization.ts`
    - Implémenter sortProjectsByOrganization()
    - Implémenter filterProjectsByTags()
    - Implémenter filterProjectsByStatus()
    - Implémenter filterProjectsByCloneStatus()
    - Implémenter sortTodos()
    - Implémenter getEffectiveStatus()
    - Implémenter validateTagName(), validateTodoDescription()
    - Implémenter canPinProject(), generateMachineId()
    - _Requirements: 1.2, 1.6, 2.5, 4.2, 4.8, 5.4, 5.6, 7.4, 7.5_
  
  - [ ]* 4.2 Écrire les tests property pour le tri
    - **Property 7: Project Sorting Order**
    - **Validates: Requirements 2.5**
  
  - [ ]* 4.3 Écrire les tests property pour le filtrage
    - **Property 4: Tag Filtering Accuracy**
    - **Property 17: Manual Status Filtering**
    - **Property 23: Clone Status Filtering**
    - **Validates: Requirements 1.6, 5.6, 7.4, 7.5**
  
  - [ ]* 4.4 Écrire les tests property pour la validation
    - **Property 2: Tag Name Validation**
    - **Property 12: TODO Description Validation**
    - **Validates: Requirements 1.2, 4.2**
  
  - [ ]* 4.5 Écrire les tests property pour le tri des TODOs
    - **Property 13: TODO Sorting Order**
    - **Validates: Requirements 4.8**

- [x] 5. Store Zustand pour Organisation
  - [x] 5.1 Créer le store d'organisation
    - Créer `src/lib/stores/organization-store.ts`
    - Implémenter l'état initial et loadFromCache()
    - Implémenter createTag(), updateTag(), deleteTag()
    - Implémenter assignTag(), removeTag()
    - Implémenter toggleFavorite(), togglePin()
    - Implémenter setManualStatus()
    - Implémenter toggleCloneStatus()
    - Implémenter saveNote(), deleteNote()
    - Implémenter addTodo(), toggleTodo(), deleteTodo(), reorderTodos(), clearCompletedTodos()
    - Implémenter getProjectOrganization(), getProjectTodos(), getIncompleteTodoCount()
    - Exporter depuis `src/lib/stores/index.ts`
    - _Requirements: 1.1-1.8, 2.1-2.8, 3.1-3.8, 4.1-4.10, 5.1-5.7, 7.1-7.2_
  
  - [ ]* 5.2 Écrire les tests property pour les tags
    - **Property 3: Tag Assignment Consistency**
    - **Property 5: Tag Deletion Cascade**
    - **Validates: Requirements 1.3, 1.4, 1.8**
  
  - [ ]* 5.3 Écrire les tests property pour favoris/pins
    - **Property 6: Favorite/Pin Toggle Consistency**
    - **Property 8: Pin Limit Enforcement**
    - **Validates: Requirements 2.1-2.4, 2.8**
  
  - [ ]* 5.4 Écrire les tests property pour les notes
    - **Property 10: Note Length Limit**
    - **Validates: Requirements 3.7**
  
  - [ ]* 5.5 Écrire les tests property pour les TODOs
    - **Property 14: TODO Count Accuracy**
    - **Property 15: TODO Limit Per Project**
    - **Validates: Requirements 4.7, 4.10**
  
  - [ ]* 5.6 Écrire les tests property pour le statut manuel
    - **Property 16: Manual Status Precedence**
    - **Validates: Requirements 5.4**
  
  - [ ]* 5.7 Écrire les tests property pour les limites globales
    - **Property 25: Global Tag Limit**
    - **Property 26: Global TODO Limit**
    - **Validates: Requirements 10.1, 10.2**

- [x] 6. Checkpoint - Core Logic Complete
  - Vérifier que tous les tests passent
  - Tester manuellement les opérations CRUD via la console
  - Vérifier la persistance LocalStorage
  - Demander à l'utilisateur si des questions se posent

- [x] 7. Composants UI - Tags
  - [x] 7.1 Créer le composant TagBadge
    - Créer `src/components/organization/tag-badge.tsx`
    - Afficher le nom et la couleur du tag
    - Supporter le mode supprimable (avec X)
    - _Requirements: 1.5_
  
  - [x] 7.2 Créer le composant TagSelector
    - Créer `src/components/organization/tag-selector.tsx`
    - Dropdown multi-select pour assigner des tags
    - Option pour créer un nouveau tag inline
    - _Requirements: 1.3, 1.4_
  
  - [x] 7.3 Créer le composant TagManager
    - Créer `src/components/organization/tag-manager.tsx`
    - Liste des tags avec édition/suppression
    - Formulaire de création de tag
    - Intégrer dans la page Settings
    - _Requirements: 1.7, 1.8, 8.1_
  
  - [ ]* 7.4 Écrire les tests unitaires pour les composants tags
    - Tester TagBadge affiche correctement
    - Tester TagSelector permet la sélection
    - Tester TagManager permet CRUD

- [x] 8. Composants UI - Notes et TODOs
  - [x] 8.1 Créer le composant NoteEditor
    - Créer `src/components/organization/note-editor.tsx`
    - Textarea avec support Markdown
    - Auto-save après 2s d'inactivité
    - Affichage de la date de modification
    - _Requirements: 3.1, 3.2, 3.3, 3.8_
  
  - [x] 8.2 Créer le composant TodoItem
    - Créer `src/components/organization/todo-item.tsx`
    - Checkbox pour compléter
    - Bouton supprimer
    - Style strikethrough si complété
    - _Requirements: 4.3, 4.5, 4.8_
  
  - [x] 8.3 Créer le composant TodoList
    - Créer `src/components/organization/todo-list.tsx`
    - Liste des TODOs avec drag & drop (@dnd-kit)
    - Input pour ajouter un TODO
    - Bouton "Effacer les tâches terminées"
    - _Requirements: 4.1, 4.6, 4.9_
  
  - [ ]* 8.4 Écrire les tests unitaires pour notes et TODOs
    - Tester NoteEditor auto-save
    - Tester TodoList drag & drop
    - Tester TodoItem toggle

- [x] 9. Composants UI - Statut et Clone
  - [x] 9.1 Créer le composant StatusSelector
    - Créer `src/components/organization/status-selector.tsx`
    - Dropdown pour sélectionner le statut manuel
    - Option pour effacer (retour au statut auto)
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 9.2 Créer le composant CloneStatus
    - Créer `src/components/organization/clone-status.tsx`
    - Toggle pour marquer comme cloné
    - Badge "local" si cloné sur cette machine
    - Liste des machines où cloné (dans modal)
    - _Requirements: 7.1, 7.3, 7.7_
  
  - [ ]* 9.3 Écrire les tests unitaires pour statut et clone
    - Tester StatusSelector change le statut
    - Tester CloneStatus toggle

- [x] 10. Intégration dans ProjectCard
  - [x] 10.1 Mettre à jour ProjectCard
    - Modifier `src/components/projects/project-card.tsx`
    - Ajouter les TagBadges
    - Ajouter icône étoile (favori) et épingle (pin)
    - Ajouter indicateur de note (icône si note existe)
    - Ajouter compteur de TODOs incomplets
    - Afficher le statut manuel si défini
    - Afficher badge "local" si cloné
    - Ajouter quick actions au hover (favori, pin)
    - _Requirements: 1.5, 2.6, 3.4, 4.7, 5.5, 7.3, 8.5_
  
  - [ ]* 10.2 Écrire les tests property pour l'affichage
    - **Property: Project card shows all organization data**
    - Tester que tous les éléments sont affichés

- [x] 11. Intégration dans ProjectModal
  - [x] 11.1 Mettre à jour ProjectModal
    - Modifier `src/components/projects/project-modal.tsx`
    - Ajouter onglet "Organisation" ou section dédiée
    - Intégrer TagSelector
    - Intégrer StatusSelector
    - Intégrer CloneStatus
    - Intégrer NoteEditor
    - Intégrer TodoList
    - _Requirements: 3.5, 8.3_
  
  - [ ]* 11.2 Écrire les tests unitaires pour le modal
    - Tester que tous les composants sont présents
    - Tester la sauvegarde des modifications

- [x] 12. Intégration dans ProjectFilters
  - [x] 12.1 Mettre à jour ProjectFilters
    - Modifier `src/components/projects/project-filters.tsx`
    - Ajouter filtre par tags (multi-select)
    - Ajouter filtre par statut manuel
    - Ajouter filtre favoris uniquement
    - Ajouter filtre clonés/non-clonés
    - _Requirements: 1.6, 2.7, 5.6, 7.4, 7.5, 8.4_
  
  - [x] 12.2 Mettre à jour la page Projects
    - Modifier `src/app/projects/page.tsx`
    - Intégrer le tri par organisation (pinned > favorites > others)
    - Appliquer les nouveaux filtres
    - _Requirements: 2.5_
  
  - [ ]* 12.3 Écrire les tests unitaires pour les filtres
    - Tester chaque filtre individuellement
    - Tester la combinaison de filtres

- [ ] 13. Checkpoint - UI Complete
  - Vérifier que tous les tests passent
  - Tester manuellement l'interface complète
  - Vérifier le responsive design
  - Demander à l'utilisateur si des questions se posent

- [ ] 14. Synchronisation Supabase
  - [ ] 14.1 Créer les tables Supabase
    - Créer les migrations SQL pour les tables
    - organization_tags, project_organizations, project_notes, project_todos, user_machines
    - Configurer les policies RLS
    - _Requirements: 6.3_
  
  - [ ] 14.2 Implémenter le service de sync
    - Créer `src/lib/supabase/organization.ts`
    - Implémenter fetchOrganizationData()
    - Implémenter syncTags(), syncProjectOrganization()
    - Implémenter syncNote(), syncTodos(), syncMachine()
    - Implémenter deleteTag(), deleteTodo()
    - Implémenter resolveConflict()
    - _Requirements: 6.3, 6.4, 6.7_
  
  - [ ] 14.3 Intégrer la sync dans le store
    - Ajouter syncWithSupabase() au store
    - Ajouter processQueue() pour le mode offline
    - Implémenter le debounce de 5s
    - Gérer les erreurs et retries
    - _Requirements: 6.5, 6.8_
  
  - [ ]* 14.4 Écrire les tests property pour la sync
    - **Property 19: Sync Data Completeness**
    - **Property 20: Conflict Resolution**
    - **Property 21: Offline Queue Persistence**
    - **Validates: Requirements 6.4, 6.7, 6.8**

- [ ] 15. Composant SyncIndicator
  - [ ] 15.1 Créer le composant SyncIndicator
    - Créer `src/components/organization/sync-indicator.tsx`
    - Afficher l'état de sync (synced, syncing, offline, error)
    - Afficher la date de dernière sync
    - Bouton pour forcer la sync
    - _Requirements: 6.9_
  
  - [ ] 15.2 Intégrer dans le Header
    - Ajouter SyncIndicator dans le header
    - _Requirements: 6.9_

- [ ] 16. Machine ID et Multi-Machines
  - [ ] 16.1 Implémenter la gestion des machines
    - Générer Machine_ID au premier lancement
    - Stocker dans LocalStorage
    - Sync avec Supabase
    - _Requirements: 6.1, 6.2_
  
  - [ ]* 16.2 Écrire les tests property pour Machine ID
    - **Property 18: Machine ID Uniqueness**
    - **Property 22: Clone Status Per Machine**
    - **Validates: Requirements 6.1, 7.1, 7.2**

- [ ] 17. Migration des Données
  - [ ] 17.1 Implémenter la migration
    - Créer `src/lib/storage/organization-migration.ts`
    - Détecter si migration nécessaire
    - Initialiser les tags par défaut
    - Créer ProjectOrganization vide pour chaque projet existant
    - Préserver toutes les données GitHub existantes
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 17.2 Écrire les tests property pour la migration
    - **Property 24: Migration Data Preservation**
    - **Validates: Requirements 9.1, 9.2**

- [ ] 18. Dashboard Updates
  - [ ] 18.1 Ajouter les widgets d'organisation au dashboard
    - Section "Projets épinglés" avec les 5 projets max
    - Compteur de TODOs incomplets total
    - _Requirements: 8.7_

- [ ] 19. Raccourcis Clavier
  - [ ] 19.1 Implémenter les raccourcis
    - F pour toggle favori sur projet sélectionné
    - P pour toggle pin sur projet sélectionné
    - _Requirements: 8.6_

- [ ] 20. Checkpoint - Feature Complete
  - Vérifier que tous les tests passent (unit + property)
  - Tester le flow complet : tags → favoris → notes → TODOs → sync
  - Tester le mode offline
  - Tester sur plusieurs "machines" (navigateurs différents)
  - Vérifier les performances
  - Demander à l'utilisateur pour review finale

- [ ] 21. Merge et Cleanup
  - [ ] 21.1 Finaliser la branche
    - Résoudre les conflits éventuels avec main
    - Vérifier que tous les tests passent
    - Créer la Pull Request
    - _Prérequis: Toutes les tâches précédentes complétées_

## Notes

- Les tâches marquées avec `*` sont des tests optionnels qui peuvent être sautés pour un MVP plus rapide
- Chaque tâche référence les requirements spécifiques pour la traçabilité
- Les checkpoints permettent de valider l'avancement et de recueillir du feedback
- Les tests property valident les propriétés de correction universelles
- Les tests unitaires valident les exemples spécifiques et les cas limites
- Tout le développement se fait sur la branche `feature/project-organization`
