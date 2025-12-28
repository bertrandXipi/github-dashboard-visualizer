'use client'

import { useEffect, useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/error-boundary'
import { toast } from 'sonner'
import { isMigrationNeeded, runMigration, resetOrganizationData } from '@/lib/storage'

export function Providers({ children }: { children: React.ReactNode }) {
  const [migrationError, setMigrationError] = useState<string | null>(null)

  useEffect(() => {
    // Run migration on app startup
    if (typeof window !== 'undefined' && isMigrationNeeded()) {
      console.log('[Providers] Running organization data migration...')
      const result = runMigration()
      
      if (!result.success) {
        console.error('[Providers] Migration failed:', result.errors)
        setMigrationError(result.errors.join(', '))
        toast.error('Erreur de migration des données', {
          description: 'Cliquez pour réinitialiser les données d\'organisation',
          action: {
            label: 'Réinitialiser',
            onClick: () => {
              resetOrganizationData()
              window.location.reload()
            },
          },
          duration: 10000,
        })
      } else {
        if (result.warnings.length > 0) {
          console.warn('[Providers] Migration warnings:', result.warnings)
        }
        console.log('[Providers] Migration completed successfully')
      }
    }
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <Toaster />
    </ThemeProvider>
  )
}
