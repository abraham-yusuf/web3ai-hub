# API Contract: Blog Content Generation & Management

**Feature**: Content Expansion (001-content-expansion)
**Date**: 2026-06-12

## Overview

Blog content lifecycle: AI generates draft → admin reviews → publish. One article at a time.

## Endpoints

### POST /api/admin/ai/generate-blog

Generate a single blog post draft via AI Writer.

**Auth**: Admin/Editor role required
**Rate Limit**: 8 requests/min (admin rate limit)

**Request Body**:
```json
{
  "category": "web3-fundamentals | ai-tutorials | airdrop-guides | opinion-news",
  "topic": "Apa Itu Blockchain?",
  "language": "id",
  "targetLength": 1500,
  "customPrompt": "optional additional instructions"
}
```

**Response (200)**:
```json
{
  "success": true,
  "draft": {
    "title": "Apa Itu Blockchain? Panduan Lengkap untuk Pemula",
    "slug": "apa-itu-blockchain-panduan-pemula",
    "excerpt": "Pelajari dasar-dasar blockchain...",
    "content": "# Apa Itu Blockchain?\n\nBlockchain adalah...",
    "category": "web3-fundamentals",
    "tags": ["blockchain", "pemula", "web3"],
    "readingTime": 8,
    "wordCount": 1500,
    "seo": {
      "titleTag": "Apa Itu Blockchain? Panduan Lengkap 2026 | AI3",
      "metaDescription": "Pelajari dasar-dasar blockchain...",
      "ogImage": "/api/og/blog/apa-itu-blockchain-panduan-pemula"
    }
  }
}
```

**Error (429)**: Rate limit exceeded
**Error (503)**: All AI providers unavailable

---

### POST /api/admin/posts/similarity-check

Check content similarity against existing published posts.

**Auth**: Admin/Editor role required

**Request Body**:
```json
{
  "content": "markdown content to check",
  "excludeSlug": "optional-slug-to-exclude"
}
```

**Response (200)**:
```json
{
  "maxSimilarity": 0.45,
  "blocked": false,
  "matches": [
    {
      "slug": "existing-post-slug",
      "title": "Existing Post Title",
      "similarity": 0.45
    }
  ]
}
```

**Response when blocked (200)**:
```json
{
  "maxSimilarity": 0.85,
  "blocked": true,
  "matches": [
    {
      "slug": "very-similar-post",
      "title": "Very Similar Post",
      "similarity": 0.85
    }
  ],
  "message": "Content similarity exceeds 80% threshold. Provide override reason to publish."
}
```

---

### PUT /api/admin/posts/[id]/publish

Publish a post with optional similarity override.

**Auth**: Admin/Editor role required

**Request Body**:
```json
{
  "scheduledFor": "2026-06-15T09:00:00Z",
  "similarityOverrideReason": "This is part 2 of a series, intentional similarity with part 1"
}
```

**Response (200)**:
```json
{
  "success": true,
  "post": {
    "id": "...",
    "slug": "...",
    "status": "PUBLISHED",
    "publishedAt": "2026-06-15T09:00:00Z"
  }
}
```

**Error (409)**: Similarity block (if no override reason provided)

---

### GET /api/admin/posts/archive-status

Get auto-archive status for opinion/news articles.

**Auth**: Admin/Editor role required

**Response (200)**:
```json
{
  "totalOpinionNews": 8,
  "archived": 2,
  "archivingSoon": [
    {
      "slug": "tren-crypto-2026",
      "title": "Tren Crypto 2026",
      "publishedAt": "2026-03-15T09:00:00Z",
      "daysUntilArchive": 15
    }
  ]
}
```

---

### POST /api/admin/posts/[id]/translate

Translate blog post to English (existing endpoint, used in workflow).

**Auth**: Admin/Editor role required
**Rate Limit**: 8 requests/min

**Request Body**:
```json
{
  "targetLanguage": "en"
}
```

**Response (200)**:
```json
{
  "success": true,
  "translatedContent": "English markdown content...",
  "needsReview": true
}
```
