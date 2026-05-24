
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, BookOpen, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function LessonStudio() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatingPhase, setGeneratingPhase] = useState(""); // 'outline' | 'content'
  const [formData, setFormData] = useState({
    topic: "",
    level: "Beginner",
    targetAudience: "",
    sectionId: "",
  });
  const [sections, setSections] = useState<{ id: string; title: string }[]>([]);
  const [result, setResult] = useState<any>(null);

  React.useEffect(() => {
    async function fetchSections() {
      try {
        const res = await fetch("/api/admin/learn/sections");
        const data = await res.json();
        if (Array.isArray(data)) {
          setSections(data);
        }
      } catch (e) {
        console.error("Failed to load sections", e);
      }
    }
    fetchSections();
  }, []);

  async function handleGenerate() {
    if (!formData.topic || !formData.sectionId) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both a topic and a target section.",
      });
      return;
    }

    setLoading(true);
    setGeneratingPhase("outline");
    
    try {
      const response = await fetch("/api/admin/learn/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Generation failed");

      setResult(data);
      toast({
        title: "Success!",
        description: "Curriculum and lessons have been generated and saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Generation Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
      setGeneratingPhase("");
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="text-primary h-8 w-8" />
          Lesson Studio
        </h1>
        <p className="text-muted-foreground text-lg">
          Automate your curriculum creation. Generate high-quality MDX lessons using AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit sticky top-6">
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
            <CardDescription>Configure the AI parameters for your new lessons.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Core Topic</Label>
              <Input 
                id="topic" 
                placeholder="e.g. Zcash Shielded Transactions" 
                value={formData.topic}
                onChange={(e) => setFormData({...formData, topic: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Complexity Level</Label>
              <Select 
                value={formData.level} 
                onValueChange={(v) => setFormData({...formData, level: v})}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectionId">Target Section</Label>
              <Select 
                value={formData.sectionId} 
                onValueChange={(v) => setFormData({...formData, sectionId: v})}
              >
                <SelectTrigger id="sectionId">
                  <SelectValue placeholder="Select a section..." />
                </SelectTrigger>
                <SelectContent>
                  {sections.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {sections.length === 0 && (
                <p className="text-xs text-muted-foreground">Loading sections...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
              <Textarea 
                id="targetAudience" 
                placeholder="e.g. Developers new to cryptography" 
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                className="resize-none"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full gap-2" 
              disabled={loading} 
              onClick={handleGenerate}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Generating..." : "Generate Curriculum"}
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {loading && (
            <Alert className="bg-primary/10 border-primary-foreground/20">
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>AI is working...</AlertTitle>
              <AlertDescription>
                {generatingPhase === "outline" 
                  ? "Designing the curriculum structure and lesson objectives..." 
                  : "Writing detailed MDX content and adding rich components..."}
              </AlertDescription>
            </Alert>
          )}

          {!loading && !result && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center space-y-4 bg-muted/30">
              <div className="p-4 bg-background rounded-full border shadow-sm">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-lg">No curriculum generated yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Configure the settings and click "Generate" to create a structured set of AI lessons.
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    {result.curriculum.title}
                  </CardTitle>
                  <CardDescription>{result.curriculum.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="divide-y border rounded-lg overflow-hidden">
                    {result.curriculum.lessons.map((lesson: any, idx: number) => (
                      <div key={lesson.slug} className="p-4 flex items-start justify-between gap-4 hover:bg-muted/50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary">Lesson {idx + 1}</span>
                            <h4 className="font-medium">{lesson.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{lesson.objective}</p>
                          <div className="flex gap-3 mt-2">
                            <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-full font-medium">
                              {lesson.estimatedMinutes} mins
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-secondary rounded-full font-medium">
                              {lesson.slug}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                           <Link href={`/admin/learn/${result.createdPages.find((p: any) => p.slug === lesson.slug)?.id}/edit`}>
                             Edit
                           </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
