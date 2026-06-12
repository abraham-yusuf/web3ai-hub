# Data Model: Content Expansion

**Date**: 2026-06-12
**Feature**: Content Expansion (001-content-expansion)

## Existing Models (No Changes Needed)

These models already exist in `prisma/schema.prisma` and require no schema changes:

### Post
- Already has: title, slug (unique), content, excerpt, coverImage, category, tags[], wordCount, readingTime, status (DRAFT/PENDING_REVIEW/APPROVED/PUBLISHED/ARCHIVED), published, featured, publishedAt, scheduledFor, authorId, language, englishVersion
- **Status ARCHIVED already exists** in the enum — auto-archive will use this

### LearnTrack
- Already has: title, slug, type (WEB3/AI), order, sections relation

### LearnSection
- Already has: title, order, trackId, pages relation

### LearnPage
- Already has: title, slug, content (MDX string), order, sectionId

### Quiz
- Already has: title, pageSlug, questions (JSON)

### Flashcard
- Already has: pageSlug, front, back

### LearnProgress
- Already has: userId, pageSlug, completed

## Schema Modifications

### Post — Add `archivedAt` field

```prisma
model Post {
  // ... existing fields ...
  archivedAt    DateTime?   // When auto-archived (opinion/news after 90 days)
}
```

**Purpose**: Track when article was auto-archived. Distinguishes between "never archived" and "archived on specific date". Enables: (a) listing filter `archivedAt IS NULL`, (b) audit trail of when archival happened, (c) potential "unarchive" feature later.

**Migration**: Add nullable column, no data loss, no backfill needed.

### Post — Add `similarityOverrideReason` field

```prisma
model Post {
  // ... existing fields ...
  similarityOverrideReason  String?   // Admin reason when overriding similarity block
}
```

**Purpose**: Audit trail when admin overrides similarity block (>80%). Required for content governance — tracks why near-duplicate content was allowed.

**Migration**: Add nullable column, no data loss.

## Entity Relationships (Existing)

```
User 1──* Post (authorId)
Post 1──* PostRevision (version tracking)
Post 1──* PostView (analytics)

LearnTrack 1──* LearnSection (trackId)
LearnSection 1──* LearnPage (sectionId)
LearnPage 1──* Quiz (pageSlug)
LearnPage 1──* Flashcard (pageSlug)
User 1──* LearnProgress (userId + pageSlug)

User 1──* UserXP (gamification)
User 1──* Streak (streak tracking)
```

## New Data Volume Estimates

| Entity | New Records | Total After |
|--------|-------------|-------------|
| Post | +20 | ~23+ |
| LearnPage | +40 | ~45+ |
| Quiz | +40 | ~45+ |
| Flashcard | +200 (5 per page) | ~225+ |
| LearnProgress | 0 (user-driven) | varies |

## Content Structure

### Blog Post MDX Frontmatter

```yaml
---
title: "Apa Itu Blockchain? Panduan Lengkap untuk Pemula"
slug: "apa-itu-blockchain-panduan-pemula"
excerpt: "Pelajari dasar-dasar blockchain, cara kerjanya, dan mengapa teknologi ini penting untuk masa depan."
category: "web3-fundamentals"
tags: ["blockchain", "pemula", "web3"]
language: "id"
coverImage: "/images/blog/blockchain-basics.webp"
publishedAt: "2026-06-15T09:00:00Z"
status: "published"
readingTime: 8
wordCount: 1500
---
```

### Learn Page Content Structure

```
Title: "Solidity Basics: Smart Contract Pertama"
Slug: "solidity-basics-smart-contract-pertama"
Section: "Solidity Fundamentals" (under LearnTrack "Web3")
Order: 1
Content Length: 800-1500 kata
Quiz: 3 questions (multiple choice)
Flashcards: 5 cards (front/back pairs)
XP Reward: 10 XP per page completion
```

## State Transitions

### Post Status Flow (Updated)

```
DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED
                                    ↓ (auto after 90 days, opinion-news only)
                                  ARCHIVED
```

### Auto-Archive Logic

```
IF post.category == "opinion-news"
AND post.status == "PUBLISHED"
AND post.publishedAt + 90 days < NOW()
AND post.archivedAt IS NULL
THEN set post.archivedAt = NOW()
```

Blog listing default query: `WHERE archivedAt IS NULL`
Direct URL access: no filter (shows archived content with "Archived" badge)
