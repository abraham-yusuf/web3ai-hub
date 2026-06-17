#!/usr/bin/env tsx
// Database backup script — run via: tsx scripts/backup-db.ts
// Usage: BACKUP_DIR=/path/to/backups tsx scripts/backup-db.ts
import { execSync } from "child_process"
import { mkdirSync } from "fs"

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) throw new Error("DATABASE_URL not set")

const backupDir = process.env.BACKUP_DIR ?? "./backups"
const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
const filename = `${backupDir}/backup-${timestamp}.sql`

try {
  mkdirSync(backupDir, { recursive: true })
  execSync(`pg_dump "${dbUrl}" > "${filename}"`, { stdio: "inherit" })
  console.log(`✅ Backup saved to ${filename}`)
} catch (error) {
  console.error("❌ Backup failed:", error)
  process.exit(1)
}
