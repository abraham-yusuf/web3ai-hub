// Subscription tier definitions and helpers
export type SubscriptionTier = "free" | "pro" | "enterprise"

export const TIER_LIMITS = {
  free: {
    aiGenerationsPerDay: 3,
    canAccessPremiumLearn: false,
    canUseAdvancedModels: false,
    maxCompareTools: 3,
  },
  pro: {
    aiGenerationsPerDay: 50,
    canAccessPremiumLearn: true,
    canUseAdvancedModels: true,
    maxCompareTools: 20,
  },
  enterprise: {
    aiGenerationsPerDay: -1, // unlimited
    canAccessPremiumLearn: true,
    canUseAdvancedModels: true,
    maxCompareTools: 20,
  },
} as const

// Get user's tier (reads from DB — extend User model when Stripe is integrated)
// For now returns "free" for all users until payment is wired
export function getUserTier(role: string): SubscriptionTier {
  // TODO: Query subscription table when Stripe is integrated
  if (role === "ADMIN") return "enterprise"
  return "free"
}

export function canAccessFeature(tier: SubscriptionTier, feature: keyof typeof TIER_LIMITS.free): boolean {
  return !!TIER_LIMITS[tier][feature]
}
