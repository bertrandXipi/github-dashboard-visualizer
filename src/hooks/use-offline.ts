'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseOfflineReturn {
  isOnline: boolean
  isOffline: boolean
  wasOffline: boolean
  clearWasOffline: () => void
}

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  
  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => {
      setIsOnline(true)
      // If we were offline, mark it so we can show sync prompt
      if (!navigator.onLine) {
        setWasOffline(true)
      }
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  const clearWasOffline = useCallback(() => {
    setWasOffline(false)
  }, [])
  
  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    clearWasOffline,
  }
}
