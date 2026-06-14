import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "placeholder",
  tracesSampleRate: "placeholder" === "production" ? 0.1 : 1.0,
  debug: false,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,
  environment: "placeholder",
})
