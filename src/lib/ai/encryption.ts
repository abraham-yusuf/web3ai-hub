import crypto from "node:crypto"
import { env } from "@/lib/env"

const ALGO = "aes-256-gcm"

function getCipherKey(): Buffer {
  if (!env.AI_SETTINGS_ENCRYPTION_KEY) {
    throw new Error("AI_SETTINGS_ENCRYPTION_KEY belum dikonfigurasi.")
  }

  const key = Buffer.from(env.AI_SETTINGS_ENCRYPTION_KEY, "base64")
  if (key.length !== 32) {
    throw new Error("AI_SETTINGS_ENCRYPTION_KEY harus base64 dari 32-byte key.")
  }

  return key
}

export function encryptSecret(plainText: string): string {
  const key = getCipherKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, key, iv)

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`
}

export function decryptSecret(cipherText: string): string {
  const key = getCipherKey()
  const [ivRaw, tagRaw, encryptedRaw] = cipherText.split(":")

  if (!ivRaw || !tagRaw || !encryptedRaw) {
    throw new Error("Format encrypted secret tidak valid.")
  }

  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivRaw, "base64"))
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final(),
  ])

  return decrypted.toString("utf8")
}
