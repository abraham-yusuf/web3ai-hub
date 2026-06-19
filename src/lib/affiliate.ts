/**
 * Affiliate Optimization — A/B Testing & Conversion Tracking
 *
 * Variant assignment uses deterministic hashing (sessionId + experimentId)
 * so the same user always sees the same variant without server state.
 */

export interface ExperimentVariant {
  id: string
  label: string
  weight: number // percentage (all weights in an experiment should sum to 100)
  config: Record<string, unknown> // variant-specific config (CTA text, color, position, etc.)
}

export interface ExperimentConfig {
  id: string
  name: string
  status: "draft" | "running" | "paused" | "completed"
  targetPage?: string
  variants: ExperimentVariant[]
  winnerId?: string | null
}

/**
 * Deterministic variant assignment using a simple hash.
 * Same sessionId + experimentId always returns the same variant.
 */
export function assignVariant(
  sessionId: string,
  experiment: ExperimentConfig,
): ExperimentVariant {
  // If experiment has a winner, always return that
  if (experiment.winnerId) {
    const winner = experiment.variants.find((v) => v.id === experiment.winnerId)
    if (winner) return winner
  }

  // Simple string hash → number between 0–99
  const hash = simpleHash(`${sessionId}:${experiment.id}`)
  const bucket = hash % 100

  // Walk through variants by weight to find the bucket
  let cumulative = 0
  for (const variant of experiment.variants) {
    cumulative += variant.weight
    if (bucket < cumulative) return variant
  }

  // Fallback to first variant
  return experiment.variants[0]
}

/**
 * Generate a stable anonymous session ID from request headers.
 * Uses IP + UA + date as fingerprint (no cookies needed).
 * Rotates daily so we don't track users long-term.
 */
export function generateSessionId(ip: string, userAgent: string): string {
  const day = new Date().toISOString().split("T")[0]
  return simpleHashStr(`${ip}:${userAgent}:${day}`)
}

/** djb2 hash → unsigned 32-bit integer */
function simpleHash(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0
  }
  return hash
}

/** djb2 hash → hex string */
function simpleHashStr(str: string): string {
  return simpleHash(str).toString(16).padStart(8, "0")
}

/**
 * Calculate experiment statistics for a variant.
 */
export interface VariantStats {
  variantId: string
  label: string
  clicks: number
  conversions: number
  revenue: number
  ctr?: number // click-through rate (needs impressions)
  conversionRate: number
  revenuePerClick: number
  confidence?: number
}

/**
 * Calculate statistical significance using a simple z-test
 * for two proportions (conversion rates).
 */
export function calculateSignificance(
  controlConversions: number,
  controlClicks: number,
  treatmentConversions: number,
  treatmentClicks: number,
): number {
  if (controlClicks === 0 || treatmentClicks === 0) return 0

  const p1 = controlConversions / controlClicks
  const p2 = treatmentConversions / treatmentClicks
  const pPool =
    (controlConversions + treatmentConversions) / (controlClicks + treatmentClicks)

  const se = Math.sqrt(pPool * (1 - pPool) * (1 / controlClicks + 1 / treatmentClicks))
  if (se === 0) return 0

  const z = Math.abs(p1 - p2) / se

  // Approximate p-value from z-score (two-tailed)
  // Using a simplified normal CDF approximation
  const confidence = 1 - 2 * normalCDF(-z)
  return Math.round(confidence * 10000) / 100 // percentage with 2 decimals
}

function normalCDF(x: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  x = Math.abs(x) / Math.sqrt(2)

  const t = 1.0 / (1.0 + p * x)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

  return 0.5 * (1.0 + sign * y)
}
