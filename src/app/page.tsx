'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { TodayCard, WeekSummary, WeekTimeline } from '@/components/dashboard'
import { LoadingScreen } from '@/components/loading-screen'
import { useAuthStore, useActivityStore, useSettingsStore } from '@/lib/stores'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const { username, isAuthenticated, isLoading: authLoading, loadFromCache: loadAuth, getDecryptedToken } = useAuthStore()
  const { loading, loadFromCache: loadActivity, syncWithGitHub } = useActivityStore()
  const { loadFromCache: loadSettings } = useSettingsStore()
  const [isInitialized, setIsInitialized] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Initialize stores from cache
  useEffect(() => {
    const init = async () => {
      await loadAuth()
      loadSettings()
      loadActivity()
      setIsInitialized(true)
    }
    init()
  }, [loadAuth, loadSettings, loadActivity])
  
  // Redirect to auth if not authenticated
  useEffect(() => {
    if (isInitialized && !authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isInitialized, authLoading, isAuthenticated, router])
  
  // Initial sync if no data
  useEffect(() => {
    const doInitialSync = async () => {
      if (isInitialized && isAuthenticated && username) {
        const { commits } = useActivityStore.getState()
        if (commits.length === 0) {
          try {
            const token = await getDecryptedToken()
            await syncWithGitHub(username, token || undefined)
          } catch (error) {
            toast.error('Erreur lors du chargement des données')
          }
        }
      }
    }
    doInitialSync()
  }, [isInitialized, isAuthenticated, username, getDecryptedToken, syncWithGitHub])
  
  // Handle refresh
  const handleRefresh = async () => {
    if (!username) return
    
    setIsRefreshing(true)
    try {
      const token = await getDecryptedToken()
      await syncWithGitHub(username, token || undefined)
      toast.success('Données mises à jour !')
    } catch (error) {
      toast.error('Erreur lors de la synchronisation')
    } finally {
      setIsRefreshing(false)
    }
  }
  
  // Show loading states
  if (!isInitialized || authLoading) {
    return <LoadingScreen progress={10} stage="Chargement..." />
  }
  
  if (loading.isLoading) {
    return <LoadingScreen progress={loading.progress} stage={loading.stage} />
  }
  
  if (!isAuthenticated) {
    return null // Will redirect
  }
  
  return (
    <DashboardLayout onRefresh={handleRefresh} isRefreshing={isRefreshing}>
      <div className="space-y-6 max-w-5xl">
        {/* Today and This Week */}
        <div className="grid gap-4 md:grid-cols-2">
          <TodayCard />
          <WeekSummary />
        </div>
        
        {/* Week Timeline */}
        <WeekTimeline />
      </div>
    </DashboardLayout>
  )
}
