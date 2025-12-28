'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Github, Eye, EyeOff, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/lib/stores'
import { validateUsername, validateToken } from '@/lib/github'

export default function AuthPage() {
  const router = useRouter()
  const { setCredentials } = useAuthStore()
  
  const [username, setUsername] = useState('bertrandXipi')
  const [token, setToken] = useState('')
  const [autoLoading, setAutoLoading] = useState(true)
  
  // Auto-login from config file
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await fetch('/api/config')
        if (res.ok) {
          const config = await res.json()
          if (config.username && config.token && config.token !== 'METS_TON_TOKEN_ICI') {
            // Auto-login with config
            await setCredentials(config.username, config.token)
            router.push('/')
            return
          }
          if (config.username) {
            setUsername(config.username)
          }
          if (config.token && config.token !== 'METS_TON_TOKEN_ICI') {
            setToken(config.token)
          }
        }
      } catch (e) {
        // Config not found, continue with manual login
      }
      setAutoLoading(false)
    }
    autoLogin()
  }, [setCredentials, router])
  const [showToken, setShowToken] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  if (autoLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    )
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      // Validate username
      const usernameValid = await validateUsername(username.trim())
      if (!usernameValid) {
        setError('Utilisateur GitHub introuvable. Vérifie le nom d\'utilisateur.')
        setIsLoading(false)
        return
      }
      
      // Validate token if provided
      if (token.trim()) {
        const tokenValid = await validateToken(token.trim())
        if (!tokenValid) {
          setError('Token invalide. Vérifie que le token est correct et non expiré.')
          setIsLoading(false)
          return
        }
      }
      
      // Save credentials
      await setCredentials(username.trim(), token.trim() || undefined)
      
      // Redirect to dashboard
      router.push('/')
    } catch (err) {
      setError('Une erreur est survenue. Réessaie plus tard.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Github className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">GitHub Activity Tracker</CardTitle>
          <CardDescription>
            Connecte-toi pour suivre ton activité GitHub
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nom d&apos;utilisateur GitHub</Label>
              <Input
                id="username"
                type="text"
                placeholder="ton-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="token">Token GitHub (optionnel)</Label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,read:user"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  Créer un token
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="relative">
                <Input
                  id="token"
                  type={showToken ? 'text' : 'password'}
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Le token permet d&apos;accéder à tes repos privés et d&apos;augmenter la limite API.
              </p>
            </div>
            
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Tes données restent sur ton navigateur.</p>
            <p>Aucune information n&apos;est envoyée à un serveur tiers.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
