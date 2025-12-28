'use client'

import { Github, Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'

interface LoadingScreenProps {
  progress: number
  stage: string
}

export function LoadingScreen({ progress, stage }: LoadingScreenProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Github className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">Chargement de tes données</h2>
              <p className="text-sm text-muted-foreground">{stage}</p>
            </div>
            
            <div className="w-full space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-xs text-muted-foreground">
                {progress}%
              </p>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Première synchronisation en cours...<br />
              Cela peut prendre quelques secondes.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
