import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Developer API | AI3 Web3AI Hub",
  description: "Public REST API for AI3 — access posts, AI tools, and more. Rate limited, no auth required.",
}

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/public/v1/posts",
    description: "Fetch published blog posts. Filter by category and language.",
    params: [
      { name: "page", type: "number", desc: "Page number (default: 1)" },
      { name: "limit", type: "number", desc: "Items per page (default: 10, max: 50)" },
      { name: "category", type: "string", desc: "Filter: web3-fundamentals | ai-tutorials | airdrop-guides | opinion-news" },
      { name: "lang", type: "string", desc: "Language filter: id | en" },
    ],
    example: `curl "https://web3ai-hub.vercel.app/api/public/v1/posts?limit=5&lang=en"`,
    response: `{
  "data": [
    {
      "id": "clx1...",
      "title": "Introduction to DeFi",
      "slug": "defi-fundamentals",
      "excerpt": "Learn the basics of decentralized finance...",
      "category": "web3-fundamentals",
      "tags": ["defi", "web3"],
      "wordCount": 1200,
      "readingTime": 6,
      "language": "en",
      "publishedAt": "2026-05-01T00:00:00Z",
      "author": { "name": "Abraham Yusuf", "username": "abrahamyusuf" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 120,
    "totalPages": 24,
    "hasNext": true,
    "hasPrev": false
  }
}`,
  },
  {
    method: "GET",
    path: "/api/public/v1/tools",
    description: "Fetch AI tools directory. Filter by category and pricing.",
    params: [
      { name: "page", type: "number", desc: "Page number (default: 1)" },
      { name: "limit", type: "number", desc: "Items per page (default: 10, max: 50)" },
      { name: "category", type: "string", desc: "Tool category (e.g. writing, coding, image, video)" },
      { name: "pricing", type: "string", desc: "Pricing filter: FREE | FREEMIUM | PAID | SUBSCRIPTION" },
    ],
    example: `curl "https://web3ai-hub.vercel.app/api/public/v1/tools?category=writing&pricing=FREE"`,
    response: `{
  "data": [
    {
      "id": "cly2...",
      "name": "ChatGPT",
      "slug": "chatgpt",
      "tagline": "AI chatbot by OpenAI",
      "category": "writing",
      "pricing": "Freemium",
      "pricingType": "FREEMIUM",
      "rating": 4.8,
      "ratingCount": 2341,
      "viewCount": 98234,
      "features": ["Chat", "Code", "Image gen", "API"],
      "platforms": ["web", "ios", "android", "api"],
      "hasFreeTrial": true,
      "websiteUrl": "https://chat.openai.com"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 200, "totalPages": 20 }
}`,
  },
]

const COMING_SOON = [
  { title: "API Key Management", desc: "Generate and manage API keys for higher rate limits and analytics tracking." },
  { title: "Webhooks", desc: "Subscribe to events: new post published, airdrop updated, tool added." },
  { title: "JavaScript SDK", desc: "npm install @web3ai-hub/sdk — typed client for Node.js and browser." },
  { title: "Python SDK", desc: "pip install web3ai-hub — native Python bindings with async support." },
  { title: "GraphQL API", desc: "Flexible query language for precise data fetching with nested relations." },
  { title: "Airdrop Endpoint", desc: "GET /api/public/v1/airdrops — active and upcoming airdrop campaigns." },
]

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  POST: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  PUT: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
}

export default function DevelopersPage() {
  return (
    <main className="container max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="mb-10">
        <Badge variant="outline" className="mb-3">🛠️ Developer API</Badge>
        <h1 className="text-4xl font-bold mb-4">AI3 Developer API</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Access AI3 content programmatically. Public REST endpoints for posts, AI tools,
          and more — no API key required for standard usage.
        </p>
      </div>

      {/* Quickstart */}
      <Card className="p-6 mb-10 bg-muted/30">
        <h2 className="font-semibold mb-3 text-lg">⚡ Quickstart</h2>
        <pre className="text-sm overflow-x-auto rounded-lg bg-background border p-4">
          <code>{`# Fetch the latest 10 English posts
curl "https://web3ai-hub.vercel.app/api/public/v1/posts?lang=en&limit=10"

# Fetch free AI writing tools
curl "https://web3ai-hub.vercel.app/api/public/v1/tools?category=writing&pricing=FREE"`}</code>
        </pre>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>📍 Base URL: <code className="bg-muted px-1 rounded">https://web3ai-hub.vercel.app</code></span>
          <span>⚡ Rate limit: <strong>100 req/hour</strong> per IP</span>
          <span>🔓 Auth: <strong>None required</strong></span>
          <span>📄 Format: <strong>JSON</strong></span>
        </div>
      </Card>

      {/* Rate Limits */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Rate Limits</h2>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Tier</th>
                <th className="text-left px-4 py-3 font-medium">Limit</th>
                <th className="text-left px-4 py-3 font-medium">Auth</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3">Public (current)</td>
                <td className="px-4 py-3">100 req/hour per IP</td>
                <td className="px-4 py-3">None</td>
              </tr>
              <tr className="text-muted-foreground">
                <td className="px-4 py-3">API Key (coming soon)</td>
                <td className="px-4 py-3">10,000 req/hour</td>
                <td className="px-4 py-3">Bearer token</td>
              </tr>
            </tbody>
          </table>
        </Card>
        <p className="text-xs text-muted-foreground mt-2">
          Rate limit headers: <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code>
        </p>
      </section>

      {/* Endpoints */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6">Endpoints</h2>
        <div className="space-y-8">
          {ENDPOINTS.map((ep) => (
            <Card key={ep.path} className="overflow-hidden">
              {/* Endpoint header */}
              <div className="flex items-center gap-3 p-4 border-b bg-muted/20">
                <span className={`text-xs font-bold px-2 py-1 rounded font-mono ${METHOD_COLORS[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="font-mono text-sm font-semibold">{ep.path}</code>
              </div>

              <div className="p-5 space-y-5">
                <p className="text-sm text-muted-foreground">{ep.description}</p>

                {/* Params */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Query Parameters</h4>
                  <div className="space-y-1.5">
                    {ep.params.map((p) => (
                      <div key={p.name} className="flex items-start gap-2 text-sm">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono shrink-0 mt-0.5">{p.name}</code>
                        <span className="text-xs text-muted-foreground shrink-0">{p.type}</span>
                        <span className="text-xs text-muted-foreground">{p.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Example */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Example Request</h4>
                  <pre className="text-xs overflow-x-auto rounded-lg bg-muted/50 border p-3">
                    <code>{ep.example}</code>
                  </pre>
                </div>

                {/* Response */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Example Response</h4>
                  <pre className="text-xs overflow-x-auto rounded-lg bg-muted/50 border p-3 max-h-48">
                    <code>{ep.response}</code>
                  </pre>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Coming Soon */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-6">Coming Soon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {COMING_SOON.map((item) => (
            <div key={item.title} className="p-4 rounded-lg border bg-card opacity-70">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-sm">{item.title}</h3>
                <Badge variant="outline" className="text-xs">Soon</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center p-8 rounded-xl border bg-card">
        <h2 className="text-xl font-semibold mb-2">Build Something Cool?</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Share what you build with the community or open an issue for new endpoints.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button asChild>
            <a href="https://github.com/abraham-yusuf/web3ai-hub/issues" target="_blank" rel="noopener noreferrer">
              Request an Endpoint
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contribute">Contribute Content</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
