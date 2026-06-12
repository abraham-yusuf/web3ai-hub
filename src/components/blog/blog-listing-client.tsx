"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import type { BlogPostData } from "@/lib/posts"

interface BlogListingClientProps {
  posts: BlogPostData[]
  initialLocale: "en" | "id"
  otherLocale: "en" | "id"
}

export function BlogListingClient({ posts, initialLocale, otherLocale }: BlogListingClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string>("All")

  const categories = React.useMemo(() => {
    const cats = Array.from(new Set(posts.map((post) => post.category ?? "General")))
    return ["All", ...cats.sort()]
  }, [posts])

  const filteredPosts = React.useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeCategory === "All" || post.category === activeCategory
      return matchesSearch && matchesCategory
    })
  }, [posts, searchQuery, activeCategory])

  const isEn = initialLocale === "en"

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={isEn ? "Search posts..." : "Cari artikel..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Locale Switcher */}
        <Link href={`/${otherLocale}/blog`}>
          <Badge variant="secondary" className="cursor-pointer hover:opacity-80">
            {otherLocale === "en" ? "🇬🇧 English" : "🇮🇩 Indonesia"}
          </Badge>
        </Link>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Filter className="h-4 w-4 text-muted-foreground self-center mr-1" />
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={
              activeCategory === category
                ? "inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium bg-primary text-primary-foreground transition-colors"
                : "inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors"
            }
          >
            {category}
          </button>
        ))}
      </div>

      {/* Post Count */}
      <p className="text-sm text-muted-foreground">
        {isEn
          ? `Showing ${filteredPosts.length} of ${posts.length} posts`
          : `Menampilkan ${filteredPosts.length} dari ${posts.length} artikel`}
      </p>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isEn
              ? searchQuery || activeCategory !== "All"
                ? "No posts match your filters."
                : "No posts yet. Check back soon!"
              : searchQuery || activeCategory !== "All"
              ? "Tidak ada artikel yang cocok dengan filter Anda."
              : "Belum ada artikel. Cek lagi nanti!"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Link key={post.slug} href={`/${initialLocale}/blog/${post.slug}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <div className="mb-2 text-xs font-medium text-primary">{post.category ?? "General"}</div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription>
                    {(post.publishedAt ?? post.createdAt ?? "").split("T")[0]}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}