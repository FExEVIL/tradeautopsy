import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getKey() {
  const secret = process.env.DATA_ENCRYPTION_KEY
  if (!secret) {
    throw new Error('DATA_ENCRYPTION_KEY is not configured')
  }

  const buffer =
    secret.length === 44
      ? Buffer.from(secret, 'base64')
      : Buffer.from(secret, 'utf8')

  if (buffer.length !== 32) {
    throw new Error('DATA_ENCRYPTION_KEY must be 32 bytes (base64 or utf8)')
  }

  return buffer
}

export function encryptString(value: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

export function decryptString(payload: string): string {
  const key = getKey()
  const buffer = Buffer.from(payload, 'base64')
  const iv = buffer.subarray(0, IV_LENGTH)
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
  const data = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
  return decrypted.toString('utf8')
}

