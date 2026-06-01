"use client"

import { useEffect, useRef } from "react"

type JsonLdProps = {
  json: object
  id?: string
}

/**
 * Injects a JSON-LD structured data block into the <head>.
 * Usage: <JsonLd json={mySchema} />
 */
export function JsonLd({ json, id }: JsonLdProps) {
  const ref = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    if (!ref.current) {
      ref.current = document.createElement("script")
      ref.current.type = "application/ld+json"
      if (id) ref.current.id = id
      ref.current.dataset.schemaType = "json-ld"
      document.head.appendChild(ref.current)
    }

    ref.current.textContent = JSON.stringify(json)

    return () => {
      if (ref.current) {
        ref.current.textContent = ""
      }
    }
  }, [json, id])

  return null
}

/**
 * Renders JSON-LD scripts from static objects.
 * Use this in page components for static JSON-LD (SSR-safe).
 */
export function JsonLdScript({ json, id }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}

/**
 * Builds a BreadcrumbList JSON-LD from an array of items.
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