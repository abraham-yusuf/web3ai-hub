"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

const CATEGORIES = [
  { value: "web3", label: "⛓️ Web3" },
  { value: "ai", label: "🤖 AI" },
  { value: "airdrop", label: "🪂 Airdrop" },
  { value: "opinion", label: "💡 Opinion" },
] as const;

type Category = typeof CATEGORIES[number]["value"];

interface FormState {
  title: string;
  category: Category;
  content: string;
  excerpt: string;
}

export default function SubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ title: "", category: "web3", content: "", excerpt: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  // Simulate unauthenticated check — real auth check happens on API
  const [showAuthCTA, setShowAuthCTA] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/community/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        setShowAuthCTA(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Submission failed. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main className="container max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-3">Submission Received!</h1>
        <p className="text-muted-foreground mb-6">
          Our team will review your submission within 48 hours. You&apos;ll be notified once it&apos;s approved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/contribute" className={cn(buttonVariants({ variant: "outline" }))}>
            Submit Another
          </Link>
          <Link href="/blog" className={cn(buttonVariants())}>
            Browse Articles
          </Link>
        </div>
      </main>
    );
  }

  if (showAuthCTA) {
    return (
      <main className="container max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-3">Sign In Required</h1>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to submit content. Create an account to earn XP and get your author badge.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/admin/login" className={cn(buttonVariants())}>
            Sign In
          </Link>
          <Button variant="outline" onClick={() => setShowAuthCTA(false)}>
            Back to Form
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/contribute" className="text-sm text-muted-foreground hover:text-foreground">&#8592; Back to Contribute</Link>
        <h1 className="text-3xl font-bold mt-4 mb-2">Submit Your Tutorial</h1>
        <p className="text-muted-foreground">Share your knowledge with the AI3 community. Submissions are reviewed within 48 hours.</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Complete Guide to DeFi Yield Farming 2026"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              required
              minLength={10}
              maxLength={200}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value as Category }))}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Short Description <span className="text-muted-foreground text-xs">(optional, 1-2 sentences)</span></Label>
            <Input
              id="excerpt"
              placeholder="A brief summary shown in article listings..."
              value={form.excerpt}
              onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
              maxLength={300}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content * <span className="text-muted-foreground text-xs">(MDX supported)</span></Label>
            <textarea
              id="content"
              placeholder="## Introduction

Write your article here. MDX formatting is supported: **bold**, code blocks, callouts, etc.

## Section 1

..."
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              required
              minLength={500}
              rows={16}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y min-h-[240px]"
            />
            <p className="text-xs text-muted-foreground">Minimum 500 characters. MDX formatting supported.</p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit for Review"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
