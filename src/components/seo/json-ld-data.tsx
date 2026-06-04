/**
 * Server-safe JSON-LD utilities — NO "use client" directive.
 * This file can be imported into React Server Components.
 *
 * For the client component (JsonLd), import from "./json-ld" instead.
 */

import type { ReactNode } from "react"

// ============================================================================
// Components
// ============================================================================

type JsonLdScriptProps = {
  json: object
  id?: string
}

/**
 * Server-safe JSON-LD script tag.
 * Renders <script type="application/ld+json"> — no hooks.
 * Use this in Server Components (pages).
 */
export function JsonLdScript({ json, id }: JsonLdScriptProps): ReactNode {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}

// ============================================================================
// Builders
// ============================================================================

/**
 * Builds a WebSite JSON-LD with SearchAction.
 */
export function buildWebsiteJsonLd(baseUrl: string, siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "id-ID",
  }
}

/**
 * Builds an Article JSON-LD for blog posts.
 */
export function buildArticleJsonLd(opts: {
  title: string
  description: string
  url: string
  publishedAt: string
  authorName: string
  authorUrl?: string
  image?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    datePublished: opts.publishedAt,
    url: opts.url,
    author: {
      "@type": "Person",
      name: opts.authorName,
      url: opts.authorUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "AI3",
      url: opts.url.replace(/\/[^/]+\/?$/, ""),
    },
    image: opts.image,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": opts.url,
    },
    inLanguage: "id-ID",
  }
}

/**
 * Builds an ItemList JSON-LD for listing pages.
 */
export function buildItemListJsonLd(
  items: Array<{ name: string; url: string; description?: string }>,
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: `${baseUrl}${item.url}`,
      description: item.description,
    })),
    numberOfItems: items.length,
  }
}

/**
 * Builds an FAQPage JSON-LD.
 */
export function buildFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

/**
 * Builds a GlossaryPage JSON-LD for the glossary index.
 */
export function buildGlossaryPageJsonLd(
  entries: Array<{ term: string; slug: string; definition: string }>,
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "GlossaryPage",
    name: "Web3 & AI Glossary — AI3",
    description:
      "Daftar istilah Web3 & AI lengkap dalam Bahasa Indonesia dan English. Jelajahi definisi, contoh, dan kategori untuk menguasai kosakata blockchain, DeFi, AI, dan lainnya.",
    numberOfItems: entries.length,
    itemListElement: entries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.term,
      item: `${baseUrl}/glossary/${entry.slug}`,
    })),
  }
}

/**
 * Builds a DefinedTerm JSON-LD for a single glossary entry.
 */
export function buildGlossaryTermJsonLd(entry: {
  term: string
  definition: string
  example?: string | null
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: entry.term,
    description: entry.definition,
    ...(entry.example
      ? {
          example: {
            "@type": "CreativeWork",
            text: entry.example,
          },
        }
      : {}),
  }
}

/**
 * Builds a BreadcrumbList JSON-LD.
 */
export function buildBreadcrumbJsonLd(
  items: Array<{ label: string; href: string }>,
  baseUrl: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  }
}