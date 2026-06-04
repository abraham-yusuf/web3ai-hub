import type { Metadata } from "next"
import { BRAND } from "@/lib/brand"
import { env } from "@/lib/env"

const APP_URL = env.NEXT_PUBLIC_APP_URL ?? env.NEXTAUTH_URL ?? "https://ai3.my.id"
const SITE_NAME = BRAND.name
const DEFAULT_DESCRIPTION = "Belajar Web3 & AI dalam satu platform. Blog, dokumentasi, airdrop hub, dan AI tools directory."

export type SeoType =
  | "website"
  | "blog_post"
  | "blog_list"
  | "learn"
  | "learn_page"
  | "airdrop"
  | "airdrop_list"
  | "ai_tools"
  | "ai_tool_detail"
  | "research"
  | "roadmap"
  | "search"

interface GenerateSeoOptions {
  title?: string
  description?: string
  canonical?: string
  type?: SeoType
  /** For blog/ai-tool/airdrop posts */
  slug?: string
  /** For OG image generation */
  imageType?: "blog" | "tool" | "airdrop" | "learn" | "default"
  /** Extra keywords */
  keywords?: string[]
  /** Published date for blog posts */
  publishedAt?: string
  /** Author for blog posts */
  author?: string
  /** Breadcrumb items for JSON-LD */
  breadcrumbs?: Array<{ label: string; href: string }>
  /** No-index/no-follow robots */
  noIndex?: boolean
  /** OG image override */
  ogImage?: string
  /** JSON-LD extra data */
  extra?: Record<string, unknown>
}

export function generateSeo(opts: GenerateSeoOptions = {}): Metadata {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    canonical,
    type = "website",
    slug,
    keywords = [],
    publishedAt,
    author,
    breadcrumbs = [],
    noIndex = false,
    ogImage,
    extra = {},
  } = opts

  const pageTitle = title
    ? `${title} — ${SITE_NAME}`
    : title
    ? title
    : undefined

  const resolvedUrl = canonical ?? resolveUrl(type, slug)
  const resolvedOgImage = ogImage ?? `${APP_URL}/api/og/${opts.imageType ?? "default"}/${slug ? encodeURIComponent(slug) : "default"}`

  // Build base metadata
  const meta: Metadata = {
    title: pageTitle,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: resolvedUrl,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },

    openGraph: buildOpenGraph({
      type,
      title: title ?? pageTitle ?? SITE_NAME,
      description,
      url: resolvedUrl,
      image: resolvedOgImage,
      publishedAt,
      author,
    }),

    twitter: buildTwitterCard({
      title: title ?? pageTitle ?? SITE_NAME,
      description,
      image: resolvedOgImage,
    }),

    other: buildExtraMeta(type, extra),
  }

  // Generate JSON-LD strings for pages that need them
  if (breadcrumbs.length > 0) {
    meta.other = {
      ...meta.other,
      ...buildBreadcrumbJsonLd(resolvedUrl, breadcrumbs),
    }
  }

  if (type === "website") {
    meta.other = {
      ...meta.other,
      ...buildWebSiteJsonLd(),
    }
  }

  return meta
}

function resolveUrl(type: SeoType, slug?: string): string {
  const paths: Record<SeoType, string | null> = {
    website: "/",
    blog_post: slug ? `/blog/${slug}` : "/blog",
    blog_list: "/blog",
    learn: "/learn",
    learn_page: slug ? `/learn/${slug}` : "/learn",
    airdrop: slug ? `/airdrop/${slug}` : "/airdrop",
    airdrop_list: "/airdrop",
    ai_tools: "/ai-tools",
    ai_tool_detail: slug ? `/ai-tools/${slug}` : "/ai-tools",
    research: "/research",
    roadmap: slug ? `/learn/roadmap/${slug}` : "/learn",
    search: "/search",
  }
  return `${APP_URL}${paths[type] ?? "/"}`
}

function buildOpenGraph(opts: {
  type: SeoType
  title: string
  description: string
  url: string
  image: string
  publishedAt?: string
  author?: string
}) {
  const og: Record<string, unknown> = {
    siteName: SITE_NAME,
    title: opts.title,
    description: opts.description,
    url: opts.url,
    images: [
      {
        url: opts.image,
        width: 1200,
        height: 630,
        alt: opts.title,
      },
    ],
    locale: "id_ID",
    type: opts.type === "blog_post" ? "article" : "website",
  }

  if (opts.type === "blog_post" && opts.publishedAt) {
    og.article = {
      publishedTime: opts.publishedAt,
      authors: opts.author ? [opts.author] : undefined,
      tags: [],
    }
  }

  return og as NonNullable<Metadata["openGraph"]>
}

function buildTwitterCard(opts: {
  title: string
  description: string
  image: string
}): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title: opts.title,
    description: opts.description,
    images: [opts.image],
    creator: "@ai3myid",
    site: "@ai3myid",
  }
}

function buildBreadcrumbJsonLd(
  url: string,
  items: Array<{ label: string; href: string }>
): Record<string, string> {
  const listItems = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: `${APP_URL}${item.href}`,
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: listItems,
  }

  return { "breadcrumb-json-ld": JSON.stringify(jsonLd) }
}

function buildWebSiteJsonLd(): Record<string, string> {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: APP_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${APP_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "id-ID",
    audience: {
      "@type": "Audience",
      name: "Indonesian Web3 & AI community",
    },
  }

  return { "website-json-ld": JSON.stringify(jsonLd) }
}

/**
 * Build Indonesian Organization structured data
 * Used for local SEO targeting Indonesian audience
 */
export function buildIndonesianOrganizationJsonLd(): string {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${APP_URL}/#organization`,
    name: "AI3 Hub",
    alternateName: "Web3AI Hub",
    description: "Platform belajar Web3 & AI dalam Bahasa Indonesia. Blog, dokumentasi, airdrop hub, dan direktori AI tools.",
    url: APP_URL,
    logo: {
      "@type": "ImageObject",
      url: `${APP_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    sameAs: [
      "https://twitter.com/ai3myid",
      "https://github.com/ai3myid",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Indonesian", "English"],
      url: `${APP_URL}/faq`,
    },
    audience: {
      "@type": "Audience",
      name: "Pengembang Web3 & AI Indonesia",
      geographicArea: {
        "@type": "Country",
        name: "Indonesia",
      },
    },
    areaServed: {
      "@type": "Country",
      name: "Indonesia",
    },
    inLanguage: "id-ID",
  }

  return JSON.stringify(orgJsonLd)
}

/**
 * Build LocalBusiness structured data for Indonesian audience
 * Optional: Used for businesses targeting local Indonesian market
 */
export function buildLocalBusinessJsonLd(): string {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${APP_URL}/#local-business`,
    name: "AI3 Hub",
    description: "Platform edukasi Web3 dan AI untuk komunitas Indonesia",
    url: APP_URL,
    telephone: "+62-xxx-xxxx-xxxx",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ID",
      addressRegion: "Indonesia",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    sameAs: [
      "https://twitter.com/ai3myid",
    ],
    priceRange: "Free",
    inLanguage: "id-ID",
  }

  return JSON.stringify(localBusinessJsonLd)
}

/**
 * Build Review aggregate for products/services
 * Shows aggregate rating for the platform
 */
export function buildAggregateReviewJsonLd(reviewCount: number, ratingValue: number): string {
  const reviewJsonLd = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    itemReviewed: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: APP_URL,
    },
    ratingCount: reviewCount,
    ratingValue: ratingValue,
    bestRating: 5,
    worstRating: 1,
  }

  return JSON.stringify(reviewJsonLd)
}

function buildExtraMeta(
  type: SeoType,
  extra: Record<string, unknown>
): Record<string, string> {
  if (type === "ai_tool_detail" && extra.tool) {
    const tool = extra.tool as {
      name: string
      tagline?: string | null
      category: string
      pricing: string
    }
    return {
      "product-json-ld": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        name: tool.name,
        description: tool.tagline ?? undefined,
        category: tool.category,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        brand: { "@type": "Brand", name: "AI3" },
      }),
    }
  }

  if (type === "airdrop" && extra.airdrop) {
    const airdrop = extra.airdrop as {
      name: string
      network: string
      status: string
      estimatedReward?: string | null
    }
    return {
      "airdrop-json-ld": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Event",
        name: `${airdrop.name} Airdrop`,
        description: `${airdrop.name} airdrop on ${airdrop.network}. Estimated reward: ${airdrop.estimatedReward ?? "TBD"}.`,
        eventStatus: airdrop.status === "ACTIVE" ? "https://schema.org/EventScheduled" : "https://schema.org/EventPostponed",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: { "@type": "VirtualLocation", url: `${APP_URL}/airdrop/${airdrop.name.toLowerCase().replace(/\s+/g, "-")}` },
      }),
    }
  }

  return {}
}

export const SEO_DEFAULTS = {
  APP_URL,
  SITE_NAME,
  DEFAULT_DESCRIPTION,
}