import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Derives a unique encryption key from user identifiers
 * Uses userId and clerkId to create a deterministic key
 */
function deriveUserKey(userId: string, clerkId: string): Buffer {
  const secret = `${userId}-${clerkId}`
  return crypto.createHash('sha256').update(secret).digest()
}

/**
 * Encrypts a string using AES-256-GCM with user-bound key
 * Returns: base64(iv:tag:encrypted)
 * 
 * @param text - The text to encrypt (e.g., Resend API key)
 * @param userId - User's database ID
 * @param clerkId - User's Clerk ID
 */
export function encryptUserData(text: string, userId: string, clerkId: string): string {
  if (!userId || !clerkId) {
    throw new Error('userId and clerkId are required for encryption')
  }

  // Generate random IV for this encryption
  const iv = crypto.randomBytes(IV_LENGTH)
  
  // Derive key from user identifiers
  const key = deriveUserKey(userId, clerkId)
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  // Encrypt
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  // Get auth tag
  const tag = cipher.getAuthTag()
  
  // Combine iv:tag:encrypted and encode as base64
  const combined = Buffer.concat([
    iv,
    tag,
    Buffer.from(encrypted, 'hex')
  ])
  
  return combined.toString('base64')
}

/**
 * Decrypts a string encrypted with encryptUserData()
 * 
 * @param encryptedData - The encrypted data (base64 string)
 * @param userId - User's database ID
 * @param clerkId - User's Clerk ID
 */
export function decryptUserData(encryptedData: string, userId: string, clerkId: string): string {
  if (!userId || !clerkId) {
    throw new Error('userId and clerkId are required for decryption')
  }

  // Decode from base64
  const combined = Buffer.from(encryptedData, 'base64')
  
  // Extract components
  const iv = combined.subarray(0, IV_LENGTH)
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH)
  
  // Derive key from user identifiers
  const key = deriveUserKey(userId, clerkId)
  
  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  
  // Decrypt
  let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Masks an API key for display (shows first 3 and last 4 characters)
 */
export function maskApiKey(key: string): string {
  if (key.length <= 7) {
    return '***'
  }
  return `${key.substring(0, 3)}${'*'.repeat(key.length - 7)}${key.substring(key.length - 4)}`
}
