'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcutOptions {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  callback: () => void
  enabled?: boolean
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useKeyboardShortcut(options: KeyboardShortcutOptions) {
  const { 
    key, 
    ctrlKey = false, 
    shiftKey = false, 
    altKey = false, 
    metaKey = false,
    callback, 
    enabled = true 
  } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger if typing in an input, textarea, or contenteditable
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    // Check if the key matches
    const keyMatches = event.key.toLowerCase() === key.toLowerCase()
    const ctrlMatches = ctrlKey === (event.ctrlKey || event.metaKey)
    const shiftMatches = shiftKey === event.shiftKey
    const altMatches = altKey === event.altKey

    if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
      event.preventDefault()
      callback()
    }
  }, [key, ctrlKey, shiftKey, altKey, callback])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, handleKeyDown])
}

/**
 * Hook for project-specific keyboard shortcuts
 */
export function useProjectShortcuts(options: {
  projectId: number | null
  onToggleFavorite: (projectId: number) => void
  onTogglePin: (projectId: number) => boolean
  enabled?: boolean
}) {
  const { projectId, onToggleFavorite, onTogglePin, enabled = true } = options

  // F for favorite
  useKeyboardShortcut({
    key: 'f',
    callback: () => {
      if (projectId) {
        onToggleFavorite(projectId)
      }
    },
    enabled: enabled && projectId !== null,
  })

  // P for pin
  useKeyboardShortcut({
    key: 'p',
    callback: () => {
      if (projectId) {
        onTogglePin(projectId)
      }
    },
    enabled: enabled && projectId !== null,
  })
}
