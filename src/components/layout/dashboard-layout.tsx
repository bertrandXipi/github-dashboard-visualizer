'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'
import { StatsPanel } from './stats-panel'
import { OfflineBanner } from './offline-banner'
import { useOffline } from '@/hooks'

interface DashboardLayoutProps {
  children: React.ReactNode
  onRefresh?: () => void
  isRefreshing?: boolean
  showStatsPanel?: boolean
}

export function DashboardLayout({ 
  children, 
  onRefresh, 
  isRefreshing,
  showStatsPanel = true 
}: DashboardLayoutProps) {
  const { isOffline, wasOffline, clearWasOffline } = useOffline()
  
  const handleSync = () => {
    clearWasOffline()
    onRefresh?.()
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header onRefresh={onRefresh} isRefreshing={isRefreshing || isOffline} />
        <OfflineBanner 
          isOffline={isOffline} 
          wasOffline={wasOffline && !isOffline}
          onSync={handleSync}
          onDismiss={clearWasOffline}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* Right Stats Panel */}
      {showStatsPanel && <StatsPanel />}
    </div>
  )
}
