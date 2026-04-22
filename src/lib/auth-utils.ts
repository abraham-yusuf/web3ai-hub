import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

const SALT_LENGTH = 16
const KEY_LENGTH = 64
const SCRYPT_COST = 16384

/**
 * Hash a password using scrypt (Node.js built-in, no external deps).
 * Format: $2b$<salt>$<hash>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex")
  const hash = scryptSync(password, salt, KEY_LENGTH, { N: SCRYPT_COST }).toString("hex")
  return `$2b$${salt}$${hash}`
}

/**
 * Verify a password against a hashed value.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = stored.split("$")
    if (parts.length !== 4 || parts[1] !== "2b") {
      return false
    }

    const salt = parts[2]
    const storedHash = parts[3]

    const hash = scryptSync(password, salt, KEY_LENGTH, { N: SCRYPT_COST }).toString("hex")

    const storedBuffer = Buffer.from(storedHash, "hex")
    const hashBuffer = Buffer.from(hash, "hex")

    if (storedBuffer.length !== hashBuffer.length) {
      return false
    }

    return timingSafeEqual(storedBuffer, hashBuffer)
  } catch {
    return false
  }
}
