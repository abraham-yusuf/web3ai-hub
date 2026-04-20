import { z } from "zod"

const nodeEnvSchema = z.enum(["development", "test", "production"]).default("development")

const serverEnvSchema = z
  .object({
    NODE_ENV: nodeEnvSchema,
    DATABASE_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),
    ADMIN_EMAIL: z.string().email().default("admin@web3aihub.com"),
    ADMIN_PASSWORD: z.string().min(8).default("admin12345"),
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GOOGLE_AI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    AI_SETTINGS_ENCRYPTION_KEY: z.string().optional(),
    NEXT_PUBLIC_ADSENSE_CLIENT: z.string().optional(),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
    NEXT_PUBLIC_UMAMI_URL: z.string().url().optional(),
  })
  .superRefine((values, context) => {
    if (values.NODE_ENV !== "test" && !values.DATABASE_URL) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["DATABASE_URL"],
        message: "DATABASE_URL wajib diisi untuk development dan production.",
      })
    }
  })

const parsed = serverEnvSchema.safeParse(process.env)

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n")
  throw new Error(`Invalid environment variables:\n${details}`)
}

export const env = parsed.data
