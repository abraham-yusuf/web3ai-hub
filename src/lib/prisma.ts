import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { env } from "@/lib/env"
import { Signer } from "@aws-sdk/rds-signer"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

async function getAuthToken(): Promise<string> {
  if (env.AURORA_HOST && env.AWS_REGION && env.AURORA_USER) {
    const signer = new Signer({
      hostname: env.AURORA_HOST,
      port: parseInt(env.AURORA_PORT),
      region: env.AWS_REGION,
      username: env.AURORA_USER,
    })
    return await signer.getAuthToken()
  }
  if (!env.AURORA_PASSWORD) {
    throw new Error("AURORA_PASSWORD atau IAM konfigurasi wajib diisi.")
  }
  return env.AURORA_PASSWORD
}

function createPrismaClient() {
  let pool: Pool

  if (env.AURORA_HOST && env.AURORA_USER && env.AURORA_DATABASE) {
    // Amazon Aurora Configuration
    pool = new Pool({
      host: env.AURORA_HOST,
      port: parseInt(env.AURORA_PORT),
      user: env.AURORA_USER,
      database: env.AURORA_DATABASE,
      // Use IAM token if available, otherwise use password
      password: () => getAuthToken(),
      ssl: {
        rejectUnauthorized: false, // Standard for RDS/Aurora with SSL
      },
    })
  } else if (env.DATABASE_URL) {
    // Standard PostgreSQL / Neon Configuration
    pool = new Pool({
      connectionString: env.DATABASE_URL,
    })
  } else {
    throw new Error("Konfigurasi database (DATABASE_URL atau AURORA_*) wajib diisi.")
  }

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
