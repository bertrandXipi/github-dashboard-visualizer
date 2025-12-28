/**
 * CryptoService - Handles encryption/decryption of sensitive data
 * Uses Web Crypto API for secure token storage
 */

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const SALT_LENGTH = 16
const IV_LENGTH = 12

/**
 * Check if Web Crypto API is available
 */
function isCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && 
         window.crypto !== undefined && 
         window.crypto.subtle !== undefined
}

/**
 * Generate a random salt for key derivation
 */
export async function generateSalt(): Promise<string> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API is not available')
  }
  
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  return arrayBufferToBase64(salt)
}

/**
 * Derive an encryption key from a salt
 * Uses PBKDF2 with a fixed passphrase combined with the salt
 */
export async function deriveKey(salt: string): Promise<CryptoKey> {
  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API is not available')
  }

  const saltBuffer = base64ToArrayBuffer(salt)
  
  // Use a combination of salt and a fixed identifier as the key material
  // This provides unique keys per salt while not requiring user input
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(`github-tracker-${salt}`),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt a token using AES-GCM
 * Returns a base64 encoded string containing IV + ciphertext
 */
export async function encryptToken(token: string, salt: string): Promise<string> {
  if (!token || token.trim() === '') {
    throw new Error('Token cannot be empty')
  }

  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API is not available')
  }

  const key = await deriveKey(salt)
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const encodedToken = new TextEncoder().encode(token)

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encodedToken
  )

  // Combine IV and ciphertext for storage
  const combined = new Uint8Array(iv.length + ciphertext.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(ciphertext), iv.length)

  return arrayBufferToBase64(combined)
}

/**
 * Decrypt a token using AES-GCM
 * Expects a base64 encoded string containing IV + ciphertext
 */
export async function decryptToken(encryptedData: string, salt: string): Promise<string> {
  if (!encryptedData || encryptedData.trim() === '') {
    throw new Error('Encrypted data cannot be empty')
  }

  if (!isCryptoAvailable()) {
    throw new Error('Web Crypto API is not available')
  }

  const key = await deriveKey(salt)
  const combined = base64ToArrayBuffer(encryptedData)

  // Extract IV and ciphertext
  const iv = combined.slice(0, IV_LENGTH)
  const ciphertext = combined.slice(IV_LENGTH)

  const decrypted = await window.crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    ciphertext
  )

  return new TextDecoder().decode(decrypted)
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * CryptoService class for object-oriented usage
 */
export class CryptoService {
  private salt: string | null = null

  /**
   * Initialize with an existing salt or generate a new one
   */
  async initialize(existingSalt?: string): Promise<string> {
    if (existingSalt) {
      this.salt = existingSalt
    } else {
      this.salt = await generateSalt()
    }
    return this.salt
  }

  /**
   * Get the current salt
   */
  getSalt(): string | null {
    return this.salt
  }

  /**
   * Encrypt a token
   */
  async encrypt(token: string): Promise<string> {
    if (!this.salt) {
      throw new Error('CryptoService not initialized. Call initialize() first.')
    }
    return encryptToken(token, this.salt)
  }

  /**
   * Decrypt a token
   */
  async decrypt(encryptedToken: string): Promise<string> {
    if (!this.salt) {
      throw new Error('CryptoService not initialized. Call initialize() first.')
    }
    return decryptToken(encryptedToken, this.salt)
  }

  /**
   * Generate a new salt (useful for testing key derivation uniqueness)
   */
  async generateNewSalt(): Promise<string> {
    return generateSalt()
  }
}

// Export a singleton instance for convenience
export const cryptoService = new CryptoService()
