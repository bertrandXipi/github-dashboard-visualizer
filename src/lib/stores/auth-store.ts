/**
 * Authentication Store
 */

import { create } from 'zustand'
import { 
  getAuthCredentials, 
  saveAuthCredentials, 
  clearAuthCredentials,
  cryptoService 
} from '@/lib/storage'

interface AuthState {
  username: string | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  setCredentials: (username: string, token?: string) => Promise<void>
  clearCredentials: () => void
  loadFromCache: () => Promise<void>
  getDecryptedToken: () => Promise<string | null>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  username: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  
  setCredentials: async (username: string, token?: string) => {
    try {
      set({ isLoading: true, error: null })
      
      let encryptedToken: string | undefined
      let salt: string | undefined
      
      if (token) {
        salt = await cryptoService.initialize()
        encryptedToken = await cryptoService.encrypt(token)
      }
      
      saveAuthCredentials({
        username,
        encryptedToken,
        salt,
      })
      
      set({
        username,
        token: encryptedToken,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: 'Erreur lors de la sauvegarde des identifiants',
        isLoading: false,
      })
      throw error
    }
  },
  
  clearCredentials: () => {
    clearAuthCredentials()
    set({
      username: null,
      token: null,
      isAuthenticated: false,
      error: null,
    })
  },
  
  loadFromCache: async () => {
    try {
      set({ isLoading: true })
      
      const credentials = getAuthCredentials()
      
      if (credentials?.username) {
        if (credentials.salt) {
          await cryptoService.initialize(credentials.salt)
        }
        
        set({
          username: credentials.username,
          token: credentials.encryptedToken || null,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        set({
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        isLoading: false,
        error: 'Erreur lors du chargement des identifiants',
      })
    }
  },
  
  getDecryptedToken: async () => {
    const { token } = get()
    if (!token) return null
    
    try {
      return await cryptoService.decrypt(token)
    } catch {
      return null
    }
  },
}))
