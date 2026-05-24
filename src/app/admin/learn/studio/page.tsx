
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, BookOpen, CheckCircle2, Save, Eye, FileText } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type GeneratedLesson = {
  title: string;
  slug: string;
  objective: string;
  estimatedMinutes: number;
};

type GeneratedCurriculum = {
  title: string;
  description: string;
  lessons: GeneratedLesson[];
};

type GeneratedPage = {
  id: string;
  slug: string;
  title: string;
};

type GenerationResult = {
  success: boolean;
  curriculum: GeneratedCurriculum;
  createdPages: GeneratedPage[];
};

type SelectedLesson = {
  id: string;
  slug: string;
  title: string;
  content: string;
};

export default function LessonStudio() {
  const [loading, setLoading] = useState(false);
  const [generatingPhase, setGeneratingPhase] = useState(""); 
  const [formData, setFormData] = useState({
    topic: "",
    level: "Beginner",
    targetAudience: "",
    sectionId: "",
  });
  const [sections, setSections] = useState<{ id: string; title: string }[]>([]);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const [selectedLesson, setSelectedLesson] = useState<SelectedLesson | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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
      toast.error("Please provide both a topic and a target section.", {
        description: "Missing information",
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

      const data: GenerationResult = await response.json();
      if (!response.ok) throw new Error("Generation failed");

      setResult(data);
      toast.success("Curriculum and lessons have been generated and saved.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Generation failed";
      toast.error(message);
    } finally {
      setLoading(false);
      setGeneratingPhase("");
    }
  }

  async function loadLessonForEdit(lessonSlug: string) {
    const page = result?.createdPages.find((p) => p.slug === lessonSlug);
    if (!page) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/learn/page/${page.id}`);
      const data = await res.json();
      
      setSelectedLesson({
        id: page.id,
        slug: page.slug,
        title: data.title,
        content: data.content
      });
      setEditContent(data.content);
    } catch (error) {
      console.error("[LEARN_STUDIO_LOAD_ERROR]", error);
      toast.error("Failed to load lesson content.");
    } finally {
      setLoading(false);
    }
  }

  async function saveLesson() {
    if (!selectedLesson) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/learn/page/${selectedLesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) throw new Error("Failed to save changes");

      toast.success("Lesson content has been updated.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save changes";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="text-primary h-8 w-8" />
          Lesson Studio
        </h1>
        <p className="text-muted-foreground text-lg">
          Automate and refine your curriculum. Generate high-quality MDX lessons and edit them in real-time.
        </p>
      </div>

      {!selectedLesson ? (
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
                <select
                  id="level"
                  value={formData.level}
                  onChange={(event) => setFormData({ ...formData, level: event.target.value })}
                  className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sectionId">Target Section</Label>
                <select
                  id="sectionId"
                  value={formData.sectionId}
                  onChange={(event) => setFormData({ ...formData, sectionId: event.target.value })}
                  className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a section...</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.title}
                    </option>
                  ))}
                </select>
                {sections.length === 0 && (
                  <p className="text-xs text-muted-foreground">Loading sections...</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
                <textarea
                  id="targetAudience"
                  placeholder="e.g. Developers new to cryptography"
                  value={formData.targetAudience}
                  onChange={(event) => setFormData({ ...formData, targetAudience: event.target.value })}
                  className="min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
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
              <div className="flex items-start gap-3 rounded-lg border border-primary-foreground/20 bg-primary/10 p-4 text-sm">
                <Loader2 className="mt-0.5 h-4 w-4 animate-spin" />
                <div className="space-y-1">
                  <p className="font-medium">AI is working...</p>
                  <p className="text-muted-foreground">
                    {generatingPhase === "outline"
                      ? "Designing the curriculum structure and lesson objectives..."
                      : "Writing detailed MDX content and adding rich components..."}
                  </p>
                </div>
              </div>
            )}

            {!loading && !result && (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center space-y-4 bg-muted/30">
                <div className="p-4 bg-background rounded-full border shadow-sm">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-lg">No curriculum generated yet</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Configure the settings and click &quot;Generate&quot; to create a structured set of AI lessons.
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
                      {result.curriculum.lessons.map((lesson, idx) => (
                        <div key={lesson.slug} className="p-4 flex items-start justify-between gap-4 hover:bg-muted/50 transition-colors group">
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => loadLessonForEdit(lesson.slug)}
                          >
                            <FileText className="mr-2 h-3 w-3" />
                            Quick Edit
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
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedLesson(null)}>
                ← Back to Curriculum
              </Button>
              <div className="text-left">
                <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
                <p className="text-sm text-muted-foreground">Editing lesson: {selectedLesson.slug}</p>
              </div>
            </div>
            <Button 
              className="gap-2 shrink-0" 
              disabled={saving} 
              onClick={saveLesson}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
            <Card className="flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b">
                <CardTitle className="text-sm font-medium">MDX Editor</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0 flex-grow overflow-hidden">
                <textarea
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  className="h-full w-full resize-none border-0 focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed"
                  placeholder="Write your MDX content here..."
                />
              </CardContent>
            </Card>

            <Card className="flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b">
                <CardTitle className="text-sm font-medium">Live Preview</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0 flex-grow overflow-auto prose prose-sm max-w-none p-6 bg-white text-black">
                <ReactMarkdown>{editContent}</ReactMarkdown>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
