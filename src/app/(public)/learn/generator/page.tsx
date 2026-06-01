"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"

const TOPICS = [
  { value: "web3", label: "Web3 & Blockchain" },
  { value: "ai", label: "AI & Machine Learning" },
  { value: "defi", label: "DeFi & Trading" },
  { value: "frontend", label: "Frontend Development" },
  { value: "smart-contracts", label: "Smart Contract Development" },
  { value: "general", label: "General / Other" },
]

export default function AIGeneratorPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    topic: "web3",
    goal: "",
    level: "Beginner",
    timeCommitment: "",
  })

  async function handleGenerate() {
    if (!formData.goal.trim()) {
      toast.error("Please enter your learning goal")
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch("/api/learn/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || "Failed to generate roadmap")
      }

      const data = await response.json()
      toast.success("Roadmap generated! Redirecting...")
      router.push(`/learn/roadmap/${data.roadmap.id}`)
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 py-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">AI Roadmap Generator</h1>
        <p className="text-muted-foreground text-lg">
          Input your goals and current level. Our AI will architect a personalized learning path just for you.
        </p>
      </div>

      <Card className="border-2 transition-all hover:border-primary/50">
        <CardHeader>
          <CardTitle className="text-xl">Personalize Your Journey</CardTitle>
          <CardDescription>Be as specific as possible about what you want to achieve.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic Area</Label>
            <select
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {TOPICS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">
              What is your goal? (e.g. &quot;I want to build a Solana DEX&quot; or &quot;Learn AI Agents from scratch&quot;)
            </Label>
            <Input
              id="goal"
              placeholder="Enter your goal..."
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="level">Current Level</Label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Daily Time Commitment (Optional)</Label>
              <Input
                id="time"
                placeholder="e.g. 2 hours/day"
                value={formData.timeCommitment}
                onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
                className="h-10"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !formData.goal.trim()}
            className="w-full h-12 text-lg gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Architecting Your Path...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate My Roadmap
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}