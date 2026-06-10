import { parseLocale, otherLocale } from "@/lib/i18n/config"
import { getPublicBlogPosts } from "@/lib/posts"
import type { Metadata } from "next"
import { BlogListingClient } from "@/components/blog/blog-listing-client"

interface PageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const loc = parseLocale(locale)
  const isEn = loc === "en"

  return {
    title: isEn ? "Blog — AI3" : "Blog — AI3",
    description: isEn
      ? "Latest articles about Web3, AI tools, airdrops, and the future of technology."
      : "Artikel terbaru seputar Web3, alat AI, airdrop, dan teknologi masa depan.",
    alternates: {
      canonical: `/${loc}/blog`,
      languages: {
        "en-US": `/en/blog`,
        "id-ID": `/id/blog`,
      },
    },
  }
}

export function generateStaticParams() {
  return [{ locale: "id" }, { locale: "en" }]
}

export default async function BlogPage({ params }: PageProps) {
  const { locale } = await params
  const loc = parseLocale(locale)
  const isEn = loc === "en"
  const lang = isEn ? "en" : "id"
  const otherLoc = otherLocale(loc)

  // Fetch all posts and filter by language
  const allPosts = await getPublicBlogPosts()

  // Filter posts by language - posts without language field are shown in both
  const posts = allPosts.filter((post) => {
    const postLang = (post as { language?: string }).language
    // If post has no language field, show it (MDX posts)
    if (!postLang) return true
    return postLang === lang
  })

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
        <p className="text-lg text-muted-foreground">
          {isEn
            ? "Latest articles about Web3, AI tools, airdrops, and the future of technology."
            : "Artikel terbaru seputar Web3, alat AI, airdrop, dan teknologi masa depan."}
        </p>
      </div>

      {/* Client-side filtered blog listing */}
      <BlogListingClient
        posts={posts}
        initialLocale={isEn ? "en" : "id"}
        otherLocale={otherLoc}
      />
    </div>
  )
}