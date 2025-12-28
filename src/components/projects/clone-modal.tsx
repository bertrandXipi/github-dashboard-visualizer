'use client'

import { useState } from 'react'
import { Download, Loader2, FolderOpen, Github } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CloneModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectName: string
  githubUrl: string
}

export function CloneModal({ open, onOpenChange, projectName, githubUrl }: CloneModalProps) {
  const [isCloning, setIsCloning] = useState(false)
  
  const handleClone = async () => {
    setIsCloning(true)
    try {
      const response = await fetch('/api/clone-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, githubUrl }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || data.error)
      }
      
      toast.success('Projet cloné et ouvert dans Kiro !')
      onOpenChange(false)
    } catch (error: any) {
      console.error('Error cloning:', error)
      toast.error(error.message || 'Erreur lors du clonage')
    } finally {
      setIsCloning(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Projet non trouvé
          </DialogTitle>
          <DialogDescription>
            Le projet <span className="font-medium text-foreground">{projectName}</span> n&apos;existe pas localement.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Veux-tu le cloner depuis GitHub ?
          </p>
          
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <Github className="h-4 w-4 text-muted-foreground" />
            <code className="text-xs flex-1 truncate">{githubUrl}</code>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleClone} disabled={isCloning}>
            {isCloning ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isCloning ? 'Clonage...' : 'Cloner et ouvrir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
