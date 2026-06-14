"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Level = "beginner" | "intermediate" | "advanced";

const LEVELS: { value: Level; label: string; emoji: string; desc: string }[] = [
  { value: "beginner", label: "Beginner", emoji: "🌱", desc: "New to Web3 and AI. Start from the fundamentals." },
  { value: "intermediate", label: "Intermediate", emoji: "🔥", desc: "Some experience. Ready to go deeper." },
  { value: "advanced", label: "Advanced", emoji: "⚡", desc: "Experienced. Looking for cutting-edge topics." },
];

const TOPICS = [
  { id: "web3", label: "Web3 Fundamentals", emoji: "⛓️" },
  { id: "ai", label: "AI & LLMs", emoji: "🤖" },
  { id: "defi", label: "DeFi & Yield", emoji: "💰" },
  { id: "solidity", label: "Solidity", emoji: "📜" },
  { id: "prompt-engineering", label: "Prompt Engineering", emoji: "💬" },
  { id: "nft", label: "NFTs", emoji: "🎨" },
  { id: "dao", label: "DAOs & Governance", emoji: "🏗️" },
  { id: "layer2", label: "Layer 2 Scaling", emoji: "⚡" },
  { id: "airdrop", label: "Airdrop Strategy", emoji: "🪂" },
  { id: "agents", label: "AI Agents", emoji: "🤖" },
];

interface RoadmapStep {
  title: string;
  description: string;
  estimatedTime: string;
  pageSlug: string;
}

interface GeneratedRoadmap {
  title: string;
  goal: string;
  steps: RoadmapStep[];
}

export default function LearnStartPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState<Level | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<GeneratedRoadmap | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!level || selectedTopics.length === 0) return;
    setIsLoading(true);
    setError("");
    setStep(3);

    try {
      const res = await fetch("/api/learn/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, topics: selectedTopics }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to generate roadmap. Please try again.");
        setStep(2);
        return;
      }

      const data = await res.json();
      setRoadmap(data.roadmap);
      setStep(4);
    } catch {
      setError("Network error. Please check your connection.");
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!roadmap) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/learn/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: roadmap.title, goal: roadmap.goal, level, steps: roadmap.steps }),
      });

      if (res.status === 401) {
        router.push("/admin/login?redirect=/learn/start");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        router.push(`/learn/roadmap/${data.id}`);
      }
    } catch {
      setError("Failed to save roadmap.");
    } finally {
      setIsSaving(false);
    }
  };

  // Step indicators
  const STEPS = ["Experience Level", "Topics", "Generating", "Your Roadmap"];

  return (
    <main className="container max-w-2xl mx-auto px-4 py-12">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8 justify-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i + 1 < step
                  ? "bg-green-500 text-white"
                  : i + 1 === step
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1 < step ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Experience level */}
      {step === 1 && (
        <div>
          <h1 className="text-2xl font-bold mb-2 text-center">What&#39;s your experience level?</h1>
          <p className="text-muted-foreground text-center mb-8">We&#39;ll tailor your learning path accordingly.</p>
          <div className="space-y-3">
            {LEVELS.map((l) => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  level === l.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{l.emoji}</span>
                  <div>
                    <div className="font-medium">{l.label}</div>
                    <div className="text-sm text-muted-foreground">{l.desc}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <Button className="w-full mt-6" onClick={() => setStep(2)} disabled={!level}>
            Next: Choose Topics →
          </Button>
        </div>
      )}

      {/* Step 2: Topic selection */}
      {step === 2 && (
        <div>
          <h1 className="text-2xl font-bold mb-2 text-center">What do you want to learn?</h1>
          <p className="text-muted-foreground text-center mb-8">Choose one or more topics. We&#39;ll build a roadmap just for you.</p>
          <div className="grid grid-cols-2 gap-3">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  selectedTopics.includes(topic.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="mr-2">{topic.emoji}</span>
                <span className="text-sm font-medium">{topic.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button className="flex-1" onClick={handleGenerate} disabled={selectedTopics.length === 0}>
              Generate My Roadmap →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Loading */}
      {step === 3 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-6 animate-pulse">🧠</div>
          <h2 className="text-2xl font-bold mb-3">Building Your Roadmap</h2>
          <p className="text-muted-foreground">
            Our AI is crafting a personalized learning path based on your level and interests...
          </p>
          <div className="mt-8 flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Roadmap Result */}
      {step === 4 && roadmap && (
        <div>
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-3">⚡ Personalized Roadmap</Badge>
            <h1 className="text-2xl font-bold mb-2">{roadmap.title}</h1>
            <p className="text-muted-foreground">{roadmap.goal}</p>
          </div>

          <div className="space-y-3 mb-8">
            {roadmap.steps.map((s, i) => (
              <Card key={s.pageSlug} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium text-sm">{s.title}</h3>
                      <span className="text-xs text-muted-foreground shrink-0">{s.estimatedTime}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setStep(2); setRoadmap(null); }}>Regenerate</Button>
            <Button className="flex-1" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Start Learning →"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
