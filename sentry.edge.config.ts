// eslint-disable-next-line @typescript-eslint/no-require-imports
const Sentry = require("@sentry/nextjs")

Sentry.init({
  dsn: process.env.SENTRY_DSN || undefined,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  debug: false,
})
