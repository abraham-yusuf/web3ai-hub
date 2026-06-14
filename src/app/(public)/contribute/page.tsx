import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Contribute | AI3 Web3AI Hub",
  description: "Share your knowledge with the AI3 community. Submit tutorials, guides, and articles on Web3, AI, and airdrops.",
}

const CONTENT_TYPES = [
  {
    icon: "⛓️",
    title: "Web3 Guides",
    desc: "Blockchain fundamentals, DeFi protocols, smart contracts, NFT strategies",
    badge: "High Demand",
  },
  {
    icon: "🤖",
    title: "AI Tutorials",
    desc: "Prompt engineering, LLM comparisons, AI tool reviews, automation workflows",
    badge: "Featured",
  },
  {
    icon: "🪂",
    title: "Airdrop Guides",
    desc: "Active campaigns, qualification strategies, scam avoidance, portfolio prep",
    badge: "High Demand",
  },
  {
    icon: "💡",
    title: "Opinion & Analysis",
    desc: "Market insights, technology analysis, industry trends, community perspectives",
    badge: null,
  },
]

const BENEFITS = [
  { icon: "⚡", title: "Earn XP", desc: "Get experience points for every approved submission. Level up your profile." },
  { icon: "🏷️", title: "Author Badge", desc: "Verified contributor badge displayed on your profile and articles." },
  { icon: "🌍", title: "Community Recognition", desc: "Get featured on the homepage and our weekly newsletter (10k+ readers)." },
  { icon: "🔗", title: "Build Your Portfolio", desc: "Published articles link to your author profile with bio and social links." },
]

const GUIDELINES = [
  "Content must be original and not plagiarized",
  "Minimum 500 words with clear structure (headings, examples)",
  "Technical accuracy required — cite sources where applicable",
  "No promotional content or undisclosed affiliate links",
  "Follow community standards: respectful, constructive, factual",
  "MDX formatting supported: code blocks, callouts, embeds",
]

export default function ContributePage() {
  return (
    <main className="container max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4">🌐 Community Contributions</Badge>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
          Contribute to AI3
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Share your Web3, AI, and airdrop knowledge with thousands of readers. 
          Earn XP, build your reputation, and help grow the community.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <Button asChild size="lg">
            <Link href="/contribute/submit">Submit a Tutorial</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="https://github.com/abraham-yusuf/web3ai-hub" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </Button>
        </div>
      </div>

      {/* Content Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">What We&#39;re Looking For</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONTENT_TYPES.map((type) => (
            <Card key={type.title} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{type.icon}</span>
                {type.badge && <Badge variant="secondary" className="text-xs">{type.badge}</Badge>}
              </div>
              <h3 className="font-semibold mb-1">{type.title}</h3>
              <p className="text-sm text-muted-foreground">{type.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Benefits for Contributors</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex gap-3 p-4 rounded-lg border bg-card">
              <span className="text-xl shrink-0">{benefit.icon}</span>
              <div>
                <h3 className="font-medium">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Submission Guidelines */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Submission Guidelines</h2>
        <Card className="p-6">
          <ul className="space-y-2">
            {GUIDELINES.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Review Process */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Review Process</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          {[
            { step: "1", title: "Submit", desc: "Fill out the submission form with your content" },
            { step: "2", title: "Review", desc: "Our team reviews within 48 hours" },
            { step: "3", title: "Publish", desc: "Approved content goes live with your author credit" },
          ].map((s) => (
            <div key={s.step} className="flex-1 text-center p-4 rounded-lg border bg-card">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto mb-2">{s.step}</div>
              <h3 className="font-medium">{s.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center p-8 rounded-xl bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 border">
        <h2 className="text-2xl font-bold mb-3">Ready to Share Your Knowledge?</h2>
        <p className="text-muted-foreground mb-6">Join hundreds of contributors building the go-to Web3 &amp; AI resource.</p>
        <Button asChild size="lg">
          <Link href="/contribute/submit">Submit a Tutorial →</Link>
        </Button>
      </div>
    </main>
  )
}
