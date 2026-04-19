import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getPrismaClient = (): PrismaClient => {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  if (!process.env.DATABASE_URL) {
    // Return a proxy that warns but doesn't throw on initialization
    return new Proxy({} as PrismaClient, {
      get: (target, prop) => {
        if (prop === '$on' || prop === '$connect' || prop === '$disconnect') return () => Promise.resolve()
        // If we access a model like 'airdrop', return another proxy
        return new Proxy({}, {
          get: () => () => {
            throw new Error(`PrismaClient: DATABASE_URL is missing. Cannot perform "${String(prop)}" operation.`)
          }
        })
      }
    })
  }

  const client = new PrismaClient()
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client
  return client
}

// Export a proxy as the default prisma instance to ensure lazy initialization
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    return (getPrismaClient() as any)[prop]
  }
})
