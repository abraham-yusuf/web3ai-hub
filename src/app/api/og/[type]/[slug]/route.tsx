import { BRAND } from "@/lib/brand"

const SITE_NAME = BRAND.name
const TAGLINE = BRAND.tagline
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "https://ai3.my.id"

// SVG OG image template — returns branded card for any content type
function buildOgSvg(opts: {
  title: string
  description?: string
  type: "blog" | "tool" | "airdrop" | "learn" | "research" | "roadmap" | "default"
  accentColor?: string
  badge?: string
}): string {
  const { title, description, type, accentColor = "#8b5cf6", badge } = opts

  const typeColors: Record<string, string> = {
    blog: "#8b5cf6",
    tool: "#10b981",
    airdrop: "#f59e0b",
    learn: "#3b82f6",
    research: "#ec4899",
    roadmap: "#06b6d4",
    default: "#8b5cf6",
  }

  const color = accentColor ?? typeColors[type] ?? "#8b5cf6"

  const badgeSvg = badge
    ? `<text x="100" y="72" font-family="sans-serif" font-size="28" font-weight="700" fill="${color}" opacity="0.9">${escapeXml(badge)}</text>`
    : ""

  const descriptionSvg = description
    ? `<text x="100" y="310" font-family="sans-serif" font-size="36" fill="#a1a1aa" font-weight="400">${escapeXml(description.slice(0, 80))}${description.length > 80 ? "…" : ""}</text>`
    : ""

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#111118"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.15"/>
      <stop offset="60%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient>
    <filter id="blur-glow">
      <feGaussianBlur stdDeviation="80"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Decorative circles -->
  <circle cx="1000" cy="100" r="300" fill="${color}" opacity="0.04" filter="url(#blur-glow)"/>
  <circle cx="200" cy="600" r="200" fill="${color}" opacity="0.03" filter="url(#blur-glow)"/>

  <!-- Grid pattern -->
  <g opacity="0.03">
    ${Array.from({ length: 12 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="630" stroke="white" stroke-width="1"/>`).join("\n    ")}
    ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="1200" y2="${i * 100}" stroke="white" stroke-width="1"/>`).join("\n    ")}
  </g>

  <!-- Logo mark -->
  <rect x="100" y="100" width="48" height="48" rx="12" fill="${color}" opacity="0.9"/>
  <text x="116" y="134" font-family="monospace" font-size="24" font-weight="800" fill="white">AI</text>

  <!-- Site name -->
  <text x="164" y="134" font-family="sans-serif" font-size="32" font-weight="700" fill="#71717a">${SITE_NAME}</text>

  <!-- Badge -->
  ${badgeSvg}

  <!-- Title -->
  <text x="100" y="220" font-family="sans-serif" font-size="72" font-weight="800" fill="white">${escapeXml(title.slice(0, 50))}${title.length > 50 ? "…" : ""}</text>

  <!-- Description -->
  ${descriptionSvg}

  <!-- Divider -->
  <rect x="100" y="360" width="80" height="4" rx="2" fill="${color}"/>

  <!-- Footer -->
  <text x="100" y="580" font-family="sans-serif" font-size="28" fill="#52525b">${BASE_URL}</text>
  <text x="100" y="540" font-family="sans-serif" font-size="28" fill="#3f3f46">${TAGLINE}</text>
</svg>`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET(
  request: Request,
  context: { params: Promise<{ type: string; slug: string }> }
) {
  const { type, slug } = await context.params
  const decodedSlug = decodeURIComponent(slug)

  // Map URL types to OG types
  const typeMap: Record<string, "blog" | "tool" | "airdrop" | "learn" | "research" | "roadmap" | "default"> = {
    blog: "blog",
    tool: "tool",
    airdrop: "airdrop",
    learn: "learn",
    research: "research",
    roadmap: "roadmap",
    default: "default",
  }

  const resolvedType = typeMap[type] ?? "default"

  // Parse slug to extract title/description
  // Format: "title|description|badge" or just "title"
  const parts = decodedSlug.split("|")
  const title = parts[0] ?? SITE_NAME
  const description = parts[1]
  const badge = parts[2]

  const svg = buildOgSvg({ title, description, type: resolvedType, badge })

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}

export const dynamic = "force-static"
export const revalidate = false