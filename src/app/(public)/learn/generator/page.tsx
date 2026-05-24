"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { RoadmapVisualizer } from "@/components/learn/roadmap-visualizer";

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  order: number;
  type: string;
  pageSlug: string | null;
  estimatedTime: string | null;
  milestone: string | null;
  isCompleted: boolean;
}

interface RoadmapData {
  id: string;
  title: string;
  goal: string;
  level: string;
  steps: RoadmapStep[];
}

export default function AIGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [formData, setFormData] = useState({
    goal: "",
    level: "Beginner",
    timeCommitment: "Standard",
  });

  async function handleGenerate() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/learn/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to generate roadmap");

      const data = await response.json();
      setRoadmap(data.roadmap);
      toast.success("Your personalized roadmap is ready!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (roadmap) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setRoadmap(null)} className="gap-2">
            <Target className="h-4 w-4" /> Create New Roadmap
          </Button>
          <Badge variant="secondary" className="px-3 py-1">
            Level: {roadmap.level}
          </Badge>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{roadmap.title}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{roadmap.goal}</p>
        </div>

        <RoadmapVisualizer
          steps={roadmap.steps}
          onToggleComplete={async (id: string) => {
            toast.info(`Step ${id} marked as completed!`);
          }}
        />
      </div>
    );
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
            <Label htmlFor="goal">
              What is your goal? (e.g. &quot;I want to build a Solana DEX&quot; or &quot;Learn AI Agents from
              scratch&quot;)
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
              <Label htmlFor="time">Time Commitment (Optional)</Label>
              <Input
                id="time"
                placeholder="e.g. 5 hours/week"
                value={formData.timeCommitment}
                onChange={(e) => setFormData({ ...formData, timeCommitment: e.target.value })}
                className="h-10"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading || !formData.goal}
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
  );
}
