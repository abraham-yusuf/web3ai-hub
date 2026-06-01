import Link from "next/link"
import type { AnchorHTMLAttributes } from "react"

type InternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  prefetch?: boolean
  href: string
}

/**
 * Drop-in replacement for Next.js <Link> with built-in SEO benefits:
 * - Adds rel="noopener noreferrer" for external links
 * - Properly formatted internal links with prefetch optimization
 * - Adds data-internal-link attribute for internal linking engine tracking
 */
export function InternalLink({
  children,
  className,
  prefetch = true,
  href,
  ...props
}: InternalLinkProps) {
  const isExternal = href.startsWith("http")

  if (isExternal) {
    return (
      <a
        {...props}
        href={href}
        className={className}
        rel="noopener noreferrer"
        target="_blank"
        data-internal-link="false"
      >
        {children}
      </a>
    )
  }

  return (
    <Link
      {...props}
      href={href}
      className={className}
      prefetch={prefetch}
      data-internal-link="true"
    >
      {children}
    </Link>
  )
}

/**
 * Smart suggestions for internal links based on content context.
 * Returns relevant pages to link to based on keywords.
 */
export function suggestInternalLinks(
  content: string,
  allPages: Array<{ slug: string; title: string; type: "blog" | "learn" | "airdrop" | "tool" }>
): Array<{ slug: string; title: string; href: string; score: number }> {
  const contentLower = content.toLowerCase()
  const wordSet = new Set(contentLower.split(/\W+/).filter(Boolean))

  const hrefs: Record<string, string> = {
    blog: `/blog/`,
    learn: `/learn/`,
    airdrop: `/airdrop/`,
    tool: `/ai-tools/`,
  }

  return allPages
    .map((page) => {
      const titleWords = page.title.toLowerCase().split(/\W+/)
      const matchCount = titleWords.filter((w) => w.length > 3 && wordSet.has(w)).length
      const score = matchCount / titleWords.length

      return {
        ...page,
        href: `${hrefs[page.type]}${page.slug}`,
        score,
      }
    })
    .filter((p) => p.score > 0.2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}