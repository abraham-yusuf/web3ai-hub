"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, BookOpen, Target, Clock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RoadmapStep {
  title: string;
  description: string;
  type: "content" | "task";
  suggestedPageSlug?: string;
}

interface RoadmapData {
  id: string;
  title: string;
  goal: string;
  level: string;
  steps: {
    title: string;
    description: string;
    order: number;
    type: string;
    pageSlug: string | null;
  }[];
}

export default function AIGeneratorPage() {
  const router = useRouter();
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
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {roadmap.goal}
          </p>
        </div>

        <div className="relative space-y-6">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted-foreground/20 hidden sm:block" />

          {roadmap.steps.sort((a, b) => a.order - b.order).map((step, index) => (
            <div key={step.id || index} className="relative flex gap-6 group">
              <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-background z-10 transition-colors group-hover:border-primary">
                {step.type === "content" ? (
                  <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                )}
              </div>
              
              <Card className="flex-1 transition-all hover:shadow-md">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Step {index + 1}: {step.type === "content" ? "Learn" : "Practice"}
                      </span>
                    </div>
                    {step.pageSlug && (
                      <Badge variant="outline" className="text-[10px]">Recommended Article</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  <div className="flex justify-end">
                    {step.pageSlug ? (
                      <Button size="sm" asChild className="gap-2">
                        <a href={`/learn/${step.pageSlug}`}>
                          Study Now <ArrowRight className="h-3 w-3" />
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">Mark as Completed</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
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
            <Label htmlFor="goal">What is your goal? (e.g. &quot;I want to build a Solana la DEX&quot; or &quot;Learn AI Agents from scratch&quot;)</Label>
            <Input 
              id="goal" 
              placeholder="Enter your goal..." 
              value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="level">Current Level</Label>
              <select 
                id="level" 
                value={formData.level}
                onChange={(e) => setFormData({...formData, level: e.target.value})}
                className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus idea-focus-ring focus:ring-2 focus:ring-ring"
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
                onChange={(e) => setFormData({...formData, timeCommitment: e.target.value})}
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
