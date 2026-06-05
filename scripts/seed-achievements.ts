import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const defaultAchievements = [
  // Posting milestones
  { slug: "first-post", name: "First Post", description: "Published your first blog post", icon: "✍️", tier: "BRONZE" as const, xpReward: 10, trigger: "post.publish", threshold: 1 },
  { slug: "prolific-writer", name: "Prolific Writer", description: "Published 10 blog posts", icon: "📝", tier: "SILVER" as const, xpReward: 50, trigger: "post.publish", threshold: 10 },
  { slug: "content-king", name: "Content King", description: "Published 50 blog posts", icon: "👑", tier: "GOLD" as const, xpReward: 200, trigger: "post.publish", threshold: 50 },

  // Learning milestones
  { slug: "first-lesson", name: "First Lesson", description: "Completed your first lesson", icon: "🎓", tier: "BRONZE" as const, xpReward: 10, trigger: "learn.complete", threshold: 1 },
  { slug: "student", name: "Dedicated Student", description: "Completed 10 lessons", icon: "📚", tier: "SILVER" as const, xpReward: 50, trigger: "learn.complete", threshold: 10 },
  { slug: "scholar", name: "Scholar", description: "Completed 50 lessons", icon: "🎓", tier: "GOLD" as const, xpReward: 200, trigger: "learn.complete", threshold: 50 },

  // Streak milestones
  { slug: "streak-7", name: "Week Warrior", description: "Maintained a 7-day streak", icon: "🔥", tier: "BRONZE" as const, xpReward: 25, trigger: "streak.7", threshold: 1 },
  { slug: "streak-30", name: "Monthly Master", description: "Maintained a 30-day streak", icon: "🔥", tier: "GOLD" as const, xpReward: 100, trigger: "streak.30", threshold: 1 },

  // XP milestones
  { slug: "xp-1k", name: "Rising Star", description: "Earned 1,000 XP", icon: "⭐", tier: "BRONZE" as const, xpReward: 25, trigger: "xp.1000", threshold: 1 },
  { slug: "xp-10k", name: "XP Champion", description: "Earned 10,000 XP", icon: "🏆", tier: "PLATINUM" as const, xpReward: 150, trigger: "xp.10000", threshold: 1 },

  // Referral
  { slug: "first-referral", name: "Networker", description: "Successfully referred your first user", icon: "🤝", tier: "SILVER" as const, xpReward: 50, trigger: "referral.use", threshold: 1 },
  { slug: "referral-master", name: "Referral Master", description: "Referred 5 users", icon: "🌐", tier: "GOLD" as const, xpReward: 100, trigger: "referral.use", threshold: 5 },

  // Airdrop
  { slug: "first-airdrop", name: "Airdrop Hunter", description: "Completed tasks for your first airdrop", icon: "💰", tier: "BRONZE" as const, xpReward: 20, trigger: "airdrop.complete", threshold: 1 },
  { slug: "airdrop-master", name: "Airdrop Master", description: "Completed tasks for 10 different airdrops", icon: "🪂", tier: "GOLD" as const, xpReward: 100, trigger: "airdrop.complete", threshold: 10 },
  { slug: "streak-100", name: "Century Streak", description: "Maintained a 100-day streak", icon: "💎", tier: "DIAMOND" as const, xpReward: 500, trigger: "streak.100", threshold: 1 },
]

async function main() {
  console.log("⏳ Seeding achievements...")

  try {
    const result = await prisma.achievement.createMany({
      skipDuplicates: true,
      data: defaultAchievements,
    })

    console.log(`✅ Successfully seeded ${result.count} achievements`)

    // Verify what was created
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ tier: "desc" }, { xpReward: "desc" }],
    })

    console.log(`📊 Total achievements in database: ${achievements.length}`)
    achievements.forEach((a) => {
      console.log(`  ${a.icon} ${a.name} (${a.tier}) - ${a.xpReward} XP`)
    })
  } catch (error) {
    console.error("❌ Error seeding achievements:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()