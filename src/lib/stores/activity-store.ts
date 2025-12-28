/**
 * Activity Data Store
 */

import { create } from 'zustand'
import type { 
  UserProfile, 
  Repository, 
  Commit, 
  WeekActivity, 
  GlobalStats,
  LoadingState 
} from '@/types'
import { LOADING_STAGES } from '@/types'
import {
  getUserProfile as fetchUserProfile,
  getRepositories as fetchRepositories,
  getAllUserCommits,
} from '@/lib/github'
import {
  getActivityCache,
  saveActivityCache,
  getUserProfile,
  getRepositories,
  getCommits,
  getWeeksActivity,
  getGlobalStats,
  updateLastSync,
  getCacheMetadata,
} from '@/lib/storage'
import {
  generateWeeksActivity,
  calculateGlobalStats,
} from '@/lib/utils/calculations'
import { getAllSummaries } from '@/lib/supabase'

interface ActivityState {
  // Data
  userProfile: UserProfile | null
  repositories: Repository[]
  commits: Commit[]
  weeksActivity: Record<string, WeekActivity>
  globalStats: GlobalStats | null
  
  // Loading state
  loading: LoadingState
  lastSync: string | null
  hasNewData: boolean
  
  // Actions
  loadFromCache: () => void
  syncWithGitHub: (username: string, token?: string) => Promise<void>
  refreshData: (username: string, token?: string) => Promise<void>
  setHasNewData: (value: boolean) => void
  updateRepoSummary: (repoId: number, summary: string) => void
  reset: () => void
}

const initialLoadingState: LoadingState = {
  isLoading: false,
  progress: 0,
  stage: '',
  error: null,
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  // Initial state
  userProfile: null,
  repositories: [],
  commits: [],
  weeksActivity: {},
  globalStats: null,
  loading: initialLoadingState,
  lastSync: null,
  hasNewData: false,
  
  loadFromCache: () => {
    const userProfile = getUserProfile()
    const repositories = getRepositories()
    const commits = getCommits()
    const weeksActivity = getWeeksActivity()
    const globalStats = getGlobalStats()
    const metadata = getCacheMetadata()
    
    set({
      userProfile,
      repositories,
      commits,
      weeksActivity,
      globalStats,
      lastSync: metadata.lastSync,
    })
    
    // Load summaries from Supabase in background
    if (userProfile?.username) {
      getAllSummaries(userProfile.username).then(summaries => {
        const { repositories: currentRepos } = get()
        const updatedRepos = currentRepos.map(repo => {
          if (summaries[repo.id]) {
            return { ...repo, aiSummary: summaries[repo.id] }
          }
          return repo
        })
        set({ repositories: updatedRepos })
      }).catch(console.error)
    }
  },
  
  syncWithGitHub: async (username: string, token?: string) => {
    try {
      // Stage 1: Fetch profile
      set({
        loading: {
          isLoading: true,
          progress: LOADING_STAGES.FETCHING_PROFILE.progress,
          stage: LOADING_STAGES.FETCHING_PROFILE.message,
          error: null,
        },
      })
      
      const userProfile = await fetchUserProfile(username, token)
      set({ userProfile })
      
      // Stage 2: Fetch repositories
      set({
        loading: {
          isLoading: true,
          progress: LOADING_STAGES.FETCHING_REPOS.progress,
          stage: LOADING_STAGES.FETCHING_REPOS.message,
          error: null,
        },
      })
      
      const repositories = await fetchRepositories(username, token)
      
      // Load summaries from Supabase
      const summaries = await getAllSummaries(username)
      
      // Merge summaries with repositories
      const reposWithSummaries = repositories.map(repo => {
        if (summaries[repo.id]) {
          return { ...repo, aiSummary: summaries[repo.id] }
        }
        return repo
      })
      
      set({ repositories: reposWithSummaries })
      
      // Stage 3: Fetch commits
      set({
        loading: {
          isLoading: true,
          progress: LOADING_STAGES.FETCHING_COMMITS.progress,
          stage: LOADING_STAGES.FETCHING_COMMITS.message,
          error: null,
        },
      })
      
      const commits = await getAllUserCommits(
        username,
        repositories,
        6, // 6 months
        token,
        (current, total) => {
          const baseProgress = LOADING_STAGES.FETCHING_COMMITS.progress
          const nextProgress = LOADING_STAGES.CALCULATING_STATS.progress
          const progress = baseProgress + ((current / total) * (nextProgress - baseProgress))
          set({
            loading: {
              isLoading: true,
              progress: Math.round(progress),
              stage: `Chargement des commits... (${current}/${total} repos)`,
              error: null,
            },
          })
        }
      )
      set({ commits })
      
      // Stage 4: Calculate statistics
      set({
        loading: {
          isLoading: true,
          progress: LOADING_STAGES.CALCULATING_STATS.progress,
          stage: LOADING_STAGES.CALCULATING_STATS.message,
          error: null,
        },
      })
      
      const weeksActivity = generateWeeksActivity(commits, 24)
      const globalStats = calculateGlobalStats(repositories, commits)
      
      set({ weeksActivity, globalStats })
      
      // Stage 5: Save to cache
      set({
        loading: {
          isLoading: true,
          progress: LOADING_STAGES.FINALIZING.progress,
          stage: LOADING_STAGES.FINALIZING.message,
          error: null,
        },
      })
      
      saveActivityCache({
        userProfile,
        repositories: reposWithSummaries,
        commits,
        weeksActivity,
        globalStats,
      })
      
      updateLastSync()
      
      // Complete
      set({
        loading: {
          isLoading: false,
          progress: LOADING_STAGES.COMPLETE.progress,
          stage: LOADING_STAGES.COMPLETE.message,
          error: null,
        },
        lastSync: new Date().toISOString(),
      })
      
    } catch (error) {
      set({
        loading: {
          isLoading: false,
          progress: 0,
          stage: '',
          error: error as any,
        },
      })
      throw error
    }
  },
  
  refreshData: async (username: string, token?: string) => {
    // For refresh, we only fetch recent data
    // This is a simplified version - could be optimized further
    await get().syncWithGitHub(username, token)
  },
  
  setHasNewData: (value: boolean) => {
    set({ hasNewData: value })
  },
  
  updateRepoSummary: (repoId: number, summary: string) => {
    const { repositories } = get()
    const updatedRepos = repositories.map(repo => 
      repo.id === repoId 
        ? { ...repo, aiSummary: summary, aiSummaryDate: new Date().toISOString() }
        : repo
    )
    set({ repositories: updatedRepos })
    
    // Also update cache
    const { userProfile, commits, weeksActivity, globalStats } = get()
    if (userProfile) {
      saveActivityCache({
        userProfile,
        repositories: updatedRepos,
        commits,
        weeksActivity,
        globalStats: globalStats || undefined,
      })
    }
  },
  
  reset: () => {
    set({
      userProfile: null,
      repositories: [],
      commits: [],
      weeksActivity: {},
      globalStats: null,
      loading: initialLoadingState,
      lastSync: null,
      hasNewData: false,
    })
  },
}))
