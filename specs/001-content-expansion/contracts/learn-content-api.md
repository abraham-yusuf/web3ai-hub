# API Contract: Learn Content Generation & Management

**Feature**: Content Expansion (001-content-expansion)
**Date**: 2026-06-12

## Overview

Learn content lifecycle: AI generates page content + quiz + flashcards → admin reviews → publish. One page at a time.

## Endpoints

### POST /api/admin/learn/pages/generate

Generate a single Learn page with content, quiz, and flashcards.

**Auth**: Admin/Editor role required
**Rate Limit**: 8 requests/min

**Request Body**:
```json
{
  "trackType": "WEB3 | AI",
  "sectionTitle": "Solidity Fundamentals",
  "topic": "Smart Contract Pertama dengan Solidity",
  "order": 1,
  "targetLength": 1200,
  "customPrompt": "optional additional instructions"
}
```

**Response (200)**:
```json
{
  "success": true,
  "page": {
    "title": "Smart Contract Pertama dengan Solidity",
    "slug": "smart-contract-pertama-solidity",
    "content": "# Smart Contract Pertama\n\nSolidity adalah bahasa...",
    "wordCount": 1200,
    "readingTime": 6,
    "quiz": {
      "title": "Quiz: Solidity Basics",
      "questions": [
        {
          "question": "Apa itu Solidity?",
          "options": ["Bahasa pemrograman", "Blockchain", "Wallet", "Exchange"],
          "correct": 0,
          "explanation": "Solidity adalah bahasa pemrograman untuk smart contracts."
        }
      ]
    },
    "flashcards": [
      {
        "front": "Apa itu Smart Contract?",
        "back": "Program yang berjalan di blockchain dan otomatis eksekusi ketika kondisi terpenuhi."
      }
    ]
  }
}
```

**Error (429)**: Rate limit exceeded
**Error (503)**: All AI providers unavailable

---

### POST /api/admin/learn/pages

Save a generated Learn page to database.

**Auth**: Admin/Editor role required

**Request Body**:
```json
{
  "title": "Smart Contract Pertama dengan Solidity",
  "slug": "smart-contract-pertama-solidity",
  "content": "MDX content...",
  "sectionId": "section-uuid",
  "order": 1,
  "quiz": {
    "title": "Quiz: Solidity Basics",
    "questions": [...]
  },
  "flashcards": [
    { "front": "...", "back": "..." }
  ]
}
```

**Response (201)**:
```json
{
  "success": true,
  "page": {
    "id": "page-uuid",
    "slug": "smart-contract-pertama-solidity",
    "sectionId": "section-uuid"
  }
}
```

**Validation**:
- wordCount must be 800-1500 (warning if outside range, not block)
- Quiz must have minimum 3 questions
- Flashcards must have minimum 5 cards

---

### GET /api/learn/progress

Get current user's learning progress across all tracks.

**Auth**: Authenticated user

**Response (200)**:
```json
{
  "tracks": [
    {
      "type": "WEB3",
      "totalPages": 25,
      "completedPages": 12,
      "progressPercent": 48,
      "sections": [
        {
          "title": "Solidity Fundamentals",
          "totalPages": 8,
          "completedPages": 5
        }
      ]
    },
    {
      "type": "AI",
      "totalPages": 22,
      "completedPages": 3,
      "progressPercent": 14,
      "sections": [...]
    }
  ],
  "totalXP": 150,
  "currentStreak": 5
}
```

---

### POST /api/learn/progress

Mark a Learn page as complete.

**Auth**: Authenticated user

**Request Body**:
```json
{
  "pageSlug": "smart-contract-pertama-solidity",
  "completed": true
}
```

**Response (200)**:
```json
{
  "success": true,
  "xpEarned": 10,
  "totalXP": 160,
  "currentStreak": 5,
  "achievementUnlocked": null
}
```

---

### POST /api/learn/quiz/submit

Submit quiz answers for a Learn page.

**Auth**: Authenticated user

**Request Body**:
```json
{
  "pageSlug": "smart-contract-pertama-solidity",
  "answers": [0, 2, 1]
}
```

**Response (200)**:
```json
{
  "score": 2,
  "total": 3,
  "percentage": 67,
  "passed": true,
  "xpEarned": 5,
  "results": [
    {
      "question": "Apa itu Solidity?",
      "correct": true,
      "explanation": "Solidity adalah bahasa pemrograman untuk smart contracts."
    }
  ]
}
```
