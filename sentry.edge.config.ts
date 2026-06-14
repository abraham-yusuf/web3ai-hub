import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "placeholder",
  tracesSampleRate: "placeholder" === "production" ? 0.1 : 1.0,
  debug: false,
})
