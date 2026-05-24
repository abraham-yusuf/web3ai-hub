
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, BookOpen, CheckCircle2, Save, Eye, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ReactMarkdown from "react-markdown";

export default function LessonStudio() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generatingPhase, setGeneratingPhase] = useState(""); 
  const [formData, setFormData] = useState({
    topic: "",
    level: "Beginner",
    targetAudience: "",
    sectionId: "",
  });
  const [sections, setSections] = useState<{ id: string; title: string }[]>([]);
  const [result, setResult] = useState<any>(null);
  
  const [selectedLesson, setSelectedLesson] = useState<{ id: string; slug: string; title: string; content: string } | null>(null);
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

  async function loadLessonForEdit(lessonSlug: string) {
    const page = result.createdPages.find((p: any) => p.slug === lessonSlug);
    if (!page) return;

    setLoading(true);
    try {
      const res = await fetch(\`/api/admin/learn/page/\${page.id}\`);
      const data = await res.json();
      
      setSelectedLesson({
        id: page.id,
        slug: page.slug,
        title: data.title,
        content: data.content
      });
      setEditContent(data.content);
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load lesson content." });
    } finally {
      setLoading(false);
    }
  }

  async function saveLesson() {
    if (!selectedLesson) return;

    setSaving(true);
    try {
      const response = await fetch(\`/api/admin/learn/page/\${selectedLesson.id}\`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (!response.ok) throw new Error("Failed to save changes");

      toast({
        title: "Saved!",
        description: "Lesson content has been updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Error",
        description: error.message,
      });
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
                <Textarea 
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
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
