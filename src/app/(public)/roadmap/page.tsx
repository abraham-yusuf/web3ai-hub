import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Public Roadmap | AI3 Web3AI Hub",
  description: "See what we are building and vote on upcoming features for the AI3 platform.",
}

type RoadmapPhase = "done" | "in-progress" | "planned" | "future";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  votes: number;
  priority: "critical" | "high" | "medium" | "low";
}

interface RoadmapPhaseData {
  id: RoadmapPhase;
  label: string;
  emoji: string;
  color: string;
  items: RoadmapItem[];
}

const ROADMAP: RoadmapPhaseData[] = [
  {
    id: "done",
    label: "Done",
    emoji: "✅",
    color: "text-green-600 dark:text-green-400",
    items: [
      { id: "d1", title: "AI Tools Directory", description: "Searchable, filterable AI tools with reviews, ratings, bookmarks, and compare.", votes: 312, priority: "critical" },
      { id: "d2", title: "Airdrop Ecosystem", description: "Active airdrops with step tracker, risk analysis, calendar, and XP rewards.", votes: 289, priority: "critical" },
      { id: "d3", title: "Learning Platform", description: "Web3 and AI tracks with 60+ lessons, progress tracking, quizzes, and flashcards.", votes: 245, priority: "critical" },
      { id: "d4", title: "Gamification System", description: "XP, levels, achievements, daily streaks, leaderboard, and referral program.", votes: 201, priority: "high" },
      { id: "d5", title: "Research Terminal", description: "AI-powered research assistant with web3 and AI context.", votes: 178, priority: "high" },
      { id: "d6", title: "Web3 Tools Suite", description: "Wallet tracker, gas tracker, NFT analyzer, DeFi analytics, contract verifier.", votes: 167, priority: "high" },
      { id: "d7", title: "Security Hardening", description: "Rate limiting, CSRF protection, security headers, audit logging.", votes: 134, priority: "critical" },
      { id: "d8", title: "Community Features (Phase 1)", description: "Content submission, contributor system, public roadmap voting.", votes: 98, priority: "high" },
    ],
  },
  {
    id: "in-progress",
    label: "In Progress",
    emoji: "🔄",
    color: "text-blue-600 dark:text-blue-400",
    items: [
      { id: "i1", title: "Personalized AI Learning Paths", description: "AI-generated learning roadmaps based on your level, goals, and interests.", votes: 267, priority: "high" },
      { id: "i2", title: "Developer API (Public REST)", description: "Public endpoints for posts, tools, and airdrops with rate limiting.", votes: 189, priority: "high" },
      { id: "i3", title: "Performance Audit (Phase 6)", description: "Lighthouse 90+ target, bundle optimization, Core Web Vitals.", votes: 145, priority: "critical" },
      { id: "i4", title: "Long-Term Vision Features", description: "AI learning start wizard, roadmap generator, developer docs page.", votes: 123, priority: "medium" },
    ],
  },
  {
    id: "planned",
    label: "Planned",
    emoji: "📝",
    color: "text-orange-600 dark:text-orange-400",
    items: [
      { id: "p1", title: "Premium Memberships", description: "Subscription tiers with advanced AI features, premium content, and unlimited generation.", votes: 412, priority: "high" },
      { id: "p2", title: "Discord Bot Integration", description: "Community sync, airdrop alerts, and XP rewards in Discord.", votes: 334, priority: "medium" },
      { id: "p3", title: "Test Coverage (E2E + Unit)", description: "Playwright E2E tests, unit tests for AI providers and utilities.", votes: 156, priority: "critical" },
      { id: "p4", title: "Telegram Integration", description: "Notifications, airdrop alerts, and community updates via Telegram bot.", votes: 298, priority: "medium" },
      { id: "p5", title: "AI Crypto Portfolio Assistant", description: "Investment guidance, portfolio tracking, and yield optimization powered by AI.", votes: 378, priority: "medium" },
    ],
  },
  {
    id: "future",
    label: "Future Vision",
    emoji: "🚀",
    color: "text-violet-600 dark:text-violet-400",
    items: [
      { id: "f1", title: "AI-Native Web3 University", description: "Structured degree programs with certifications and AI tutors.", votes: 523, priority: "medium" },
      { id: "f2", title: "Autonomous AI Learning Agents", description: "Personal AI tutors that adapt to your pace and learning style.", votes: 467, priority: "medium" },
      { id: "f3", title: "Decentralized AI Infrastructure", description: "On-chain compute for decentralized AI model training and inference.", votes: 289, priority: "low" },
      { id: "f4", title: "Multi-Agent AI Workflows", description: "Orchestrate multiple AI agents for complex research and content creation.", votes: 234, priority: "low" },
      { id: "f5", title: "Public SDK", description: "JavaScript/Python client library for the AI3 Developer API.", votes: 198, priority: "low" },
    ],
  },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function RoadmapPage() {
  return (
    <main className="container max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <Badge variant="outline" className="mb-4">📍 Public Roadmap</Badge>
        <h1 className="text-4xl font-bold mb-4">What We&#39;re Building</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track our progress and see what&#39;s coming next. Vote counts reflect community interest from GitHub Issues and user surveys.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <a href="https://github.com/abraham-yusuf/web3ai-hub/issues" target="_blank" rel="noopener noreferrer">
            💡 Suggest a Feature on GitHub
          </a>
        </Button>
      </div>

      {/* Phase Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {ROADMAP.map((phase) => (
          <div key={phase.id}>
            {/* Phase Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{phase.emoji}</span>
              <h2 className={`font-semibold text-lg ${phase.color}`}>{phase.label}</h2>
              <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {phase.items.length}
              </span>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {phase.items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-sm leading-snug">{item.title}</h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${PRIORITY_COLORS[item.priority]}`}>
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>👍</span>
                    <span>{item.votes.toLocaleString()} votes</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-12 text-center p-8 rounded-xl border bg-card">
        <h2 className="text-xl font-semibold mb-2">Have an Idea?</h2>
        <p className="text-muted-foreground mb-4">
          Open an issue on GitHub or join our community to suggest features and vote.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button asChild>
            <a href="https://github.com/abraham-yusuf/web3ai-hub/issues/new" target="_blank" rel="noopener noreferrer">
              Open GitHub Issue
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contribute">Contribute Content</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
