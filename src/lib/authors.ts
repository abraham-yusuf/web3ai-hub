import { prisma } from "@/lib/prisma"

export interface AuthorProfile {
  username: string
  name: string
  image?: string | null
  bio?: string | null
  socials: {
    twitter?: string | null
    github?: string | null
    linkedin?: string | null
    telegram?: string | null
  }
}

function toAuthorProfile(username: string, user?: {
  name?: string | null
  image?: string | null
  bio?: string | null
  twitter?: string | null
  github?: string | null
  linkedin?: string | null
  telegram?: string | null
}): AuthorProfile {
  return {
    username,
    name: user?.name ?? `@${username}`,
    image: user?.image,
    bio: user?.bio,
    socials: {
      twitter: user?.twitter,
      github: user?.github,
      linkedin: user?.linkedin,
      telegram: user?.telegram,
    },
  }
}

export async function getAuthorProfilesByUsernames(usernames: string[]): Promise<Record<string, AuthorProfile>> {
  const unique = Array.from(new Set(usernames.map((username) => username.trim()).filter(Boolean)))
  if (unique.length === 0) return {}

  try {
    const users = await prisma.user.findMany({
      where: { username: { in: unique } },
      select: {
        username: true,
        name: true,
        image: true,
        bio: true,
        twitter: true,
        github: true,
        linkedin: true,
        telegram: true,
      },
    })

    const profiles: Record<string, AuthorProfile> = {}
    for (const username of unique) {
      profiles[username] = toAuthorProfile(username)
    }

    for (const user of users) {
      if (!user.username) continue
      profiles[user.username] = toAuthorProfile(user.username, user)
    }

    return profiles
  } catch {
    const profiles: Record<string, AuthorProfile> = {}
    for (const username of unique) {
      profiles[username] = toAuthorProfile(username)
    }
    return profiles
  }
}

