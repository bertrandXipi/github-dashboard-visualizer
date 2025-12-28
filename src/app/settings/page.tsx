'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Trash2, RefreshCw, Moon, Sun, Monitor } from 'lucide-react'
import { DashboardLayout } from '@/components/layout'
import { LoadingScreen } from '@/components/loading-screen'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuthStore, useActivityStore, useSettingsStore } from '@/lib/stores'
import { clearAllData, exportAllData, getCacheSize } from '@/lib/storage'
import { formatBytes } from '@/lib/utils/formatters'
import { formatDate } from '@/lib/utils/date-helpers'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const router = useRouter()
  const { username, isAuthenticated, isLoading: authLoading, loadFromCache: loadAuth, clearCredentials } = useAuthStore()
  const { lastSync, loadFromCache: loadActivity, reset: resetActivity } = useActivityStore()
  const { 
    weeksToDisplay, 
    dateFormat,
    loadFromCache: loadSettings,
    setWeeksToDisplay,
    setDateFormat 
  } = useSettingsStore()
  const { theme, setTheme } = useTheme()
  
  const [isInitialized, setIsInitialized] = useState(false)
  const [cacheSize, setCacheSize] = useState(0)
  
  // Initialize
  useEffect(() => {
    const init = async () => {
      await loadAuth()
      loadSettings()
      loadActivity()
      setCacheSize(getCacheSize())
      setIsInitialized(true)
    }
    init()
  }, [loadAuth, loadSettings, loadActivity])
  
  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !authLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isInitialized, authLoading, isAuthenticated, router])
  
  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `github-activity-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Données exportées !')
  }
  
  const handleClearCache = () => {
    if (confirm('Es-tu sûr de vouloir vider le cache ? Tu devras re-télécharger toutes les données.')) {
      clearAllData()
      resetActivity()
      setCacheSize(0)
      toast.success('Cache vidé !')
    }
  }
  
  const handleLogout = () => {
    clearCredentials()
    router.push('/auth')
  }
  
  const handleDeleteAccount = () => {
    if (confirm('Es-tu sûr de vouloir supprimer toutes tes données ? Cette action est irréversible.')) {
      clearAllData()
      clearCredentials()
      router.push('/auth')
      toast.success('Toutes les données ont été supprimées')
    }
  }
  
  if (!isInitialized || authLoading) {
    return <LoadingScreen progress={10} stage="Chargement..." />
  }
  
  if (!isAuthenticated) {
    return null
  }
  
  return (
    <DashboardLayout showStatsPanel={false}>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Configure ton application
          </p>
        </div>
        
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Connexion GitHub</CardTitle>
            <CardDescription>Ton compte GitHub connecté</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{username}</p>
                <p className="text-sm text-muted-foreground">
                  Dernière sync : {lastSync ? formatDate(lastSync, 'relative') : 'Jamais'}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Changer de compte
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Display preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Préférences d&apos;affichage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Theme */}
            <div className="flex items-center justify-between">
              <Label>Thème</Label>
              <div className="flex gap-1">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setTheme('light')}
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setTheme('dark')}
                >
                  <Moon className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setTheme('system')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Date format */}
            <div className="flex items-center justify-between">
              <Label>Format de date</Label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as any)}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="relative">Relatif (il y a 2 jours)</option>
                <option value="eu">Européen (25/12/2024)</option>
                <option value="us">Américain (12/25/2024)</option>
              </select>
            </div>
            
            {/* Weeks to display */}
            <div className="flex items-center justify-between">
              <Label>Semaines à afficher</Label>
              <select
                value={weeksToDisplay}
                onChange={(e) => setWeeksToDisplay(parseInt(e.target.value))}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                {[4, 8, 12, 16, 20, 24].map((n) => (
                  <option key={n} value={n}>{n} semaines</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
        
        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle>Export</CardTitle>
            <CardDescription>Télécharge tes données</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Télécharger toutes mes données (JSON)
            </Button>
          </CardContent>
        </Card>
        
        {/* Cache */}
        <Card>
          <CardHeader>
            <CardTitle>Cache et données</CardTitle>
            <CardDescription>Gère le stockage local</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Espace utilisé</p>
                <p className="text-2xl font-bold">{formatBytes(cacheSize)}</p>
              </div>
              <Button variant="outline" onClick={handleClearCache}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Vider le cache
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Danger zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
            <CardDescription>Actions irréversibles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer toutes mes données
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
