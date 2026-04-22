import { z } from "zod"

/**
 * Environment Modes:
 * - development: Local dev, requires DATABASE_URL + NEXTAUTH_SECRET
 * - staging: Preview/UAT, same as production but for testing
 * - production: Live environment, all secrets via platform deploy (e.g. Vercel)
 * - test: Unit/integration tests, DATABASE_URL optional
 */
const nodeEnvSchema = z.enum(["development", "staging", "test", "production"]).default("development")

const serverEnvSchema = z
  .object({
    NODE_ENV: nodeEnvSchema,
    DATABASE_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),

    // Bootstrap admin (initial setup only — ignore in production)
    ADMIN_EMAIL: z.string().email().default("admin@web3aihub.com"),
    ADMIN_PASSWORD: z.string().min(8).default("admin12345"),

    // AI Providers (at least one recommended)
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GOOGLE_AI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),

    // Encryption
    AI_SETTINGS_ENCRYPTION_KEY: z.string().optional(),

    // AdSense
    NEXT_PUBLIC_ADSENSE_CLIENT: z.string().optional(),

    // Cloudflare R2 Storage
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),

    // Analytics (Umami)
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
    NEXT_PUBLIC_UMAMI_URL: z.string().url().optional(),

    // Resend (email)
    RESEND_API_KEY: z.string().optional(),

    // App URL (for sitemap, OG, canonical)
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  })
  .superRefine((values, context) => {
    const isProduction = values.NODE_ENV === "production" || values.NODE_ENV === "staging"

    if (values.NODE_ENV !== "test" && !values.DATABASE_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL wajib diisi untuk development, staging, dan production.",
      })
    }

    if (isProduction && values.ADMIN_PASSWORD === "admin12345") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ADMIN_PASSWORD"],
        message: "ADMIN_PASSWORD harus diganti dari default untuk staging/production.",
      })
    }
  })

const parsed = serverEnvSchema.safeParse(process.env)

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `  ${issue.path.join(".")}: ${issue.message}`).join("\n")
  console.error(`\n❌ Invalid environment variables:\n${details}\n`)
  throw new Error(`Invalid environment variables:\n${details}`)
}

export const env = parsed.data

export type Env = z.infer<typeof serverEnvSchema>
