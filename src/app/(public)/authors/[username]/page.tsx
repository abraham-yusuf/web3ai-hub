import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthorProfilesByUsernames } from "@/lib/authors"
import { getPublicBlogPosts } from "@/lib/posts"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

interface AuthorPageProps {
  params: Promise<{ username: string }>
}

function isValidUsername(value: string): boolean {
  const normalized = value.trim()
  if (!normalized) return false
  return /^[a-z0-9](?:[a-z0-9_-]{0,37}[a-z0-9])?$/i.test(normalized)
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { username } = await params

  if (!isValidUsername(username)) {
    return { title: "Author Not Found" }
  }

  const profiles = await getAuthorProfilesByUsernames([username])
  const profile = profiles[username]

  return {
    title: profile?.name ?? `@${username}`,
    description: profile?.bio ?? `Profil penulis @${username}.`,
    alternates: { canonical: `/authors/${username}` },
  }
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { username } = await params

  if (!isValidUsername(username)) {
    notFound()
  }

  const [profiles, posts] = await Promise.all([getAuthorProfilesByUsernames([username]), getPublicBlogPosts()])
  const profile = profiles[username]

  const contributions = posts.filter((post) => (post.authors ?? []).includes(username))

  if (!profile && contributions.length === 0) {
    notFound()
  }

  const socials = [
    { label: "Twitter / X", href: profile?.socials.twitter },
    { label: "GitHub", href: profile?.socials.github },
    { label: "LinkedIn", href: profile?.socials.linkedin },
    { label: "Telegram", href: profile?.socials.telegram },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href))

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-2xl">{profile?.name ?? `@${username}`}</CardTitle>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.bio ? <p className="text-sm text-muted-foreground">{profile.bio}</p> : null}

          {socials.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Social</p>
              <ul className="space-y-1 text-sm">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a href={social.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Kontribusi</h1>
          <p className="text-sm text-muted-foreground">
            {contributions.length} tulisan dipublikasikan.
          </p>
        </div>

        {contributions.length > 0 ? (
          <div className="grid gap-4">
            {contributions.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-lg border p-4 transition-colors hover:border-primary">
                <p className="text-sm font-semibold">{post.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Belum ada kontribusi yang dipublikasikan.
          </div>
        )}
      </section>
    </div>
  )
}

