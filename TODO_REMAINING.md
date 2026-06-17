# 🚀 Web3AI-Hub — TODO (Unfinished Tasks Only)

**Last Updated:** 2026-06-16  
**Current Sprint:** Post-Sprint 21 — Ready for next phase

---

## 🔴 HIGH PRIORITY — Sebelum Launch

### ⚡ Performance Audit (Phase 6)

> Target Lighthouse 90+ semua metrik.

- [ ] Lighthouse baseline audit (desktop + mobile)
- [ ] JS bundle size audit & optimization
- [ ] Image optimization audit (next/image, WebP/AVIF)
- [ ] Core Web Vitals measurement & fix
- [ ] Database query optimization — cek N+1 queries (Prisma `tracing`)
- [ ] Edge caching strategy (ISR revalidation times review)
- [ ] Lazy loading improvements

### 🧪 Testing (Phase 6)

> Roadmap target unit + integration + E2E, saat ini hanya test dasar.

- [ ] Unit tests: `lib/ai/providers.ts` (fallback logic, model selection)
- [ ] Unit tests: utility functions (`lib/utils/`, `lib/mdx/`)
- [ ] Integration tests: API routes (`/api/ai/generate`, `/api/ai/chat`, `/api/airdrop/*`)
- [ ] Integration tests: Prisma CRUD operations
- [ ] E2E tests: critical user journeys (Playwright)
  - Blog listing → detail → share
  - Airdrop listing → detail → step tracker
  - AI Tools search → compare
  - Admin login → create post → publish

---

## 🟠 MEDIUM PRIORITY — Pasca Launch

### 📈 Growth System (Phase 7)

- [ ] Discord integration (bot, community sync)
- [ ] Telegram integration (notifications, airdrop alerts)

### 💰 Monetization (Phase 7)

- [ ] Sponsored airdrops (paid featured placement)
- [ ] Sponsored AI tools (promoted listings)
- [ ] Affiliate optimization (A/B testing, conversion tracking)

---

## 🟢 LOW PRIORITY — Future

### 🌍 Community & Ecosystem (Phase 8)

- [ ] Public author profiles (SEO-friendly author pages)
- [ ] Reputation system (karma, badges, trust scores)
- [ ] Community moderation (report, review, approve)
- [ ] Plugin system (third-party extensions)
- [ ] Public SDK (JavaScript/Python client library)
- [ ] Third-party integrations (Notion, Obsidian, etc.)

### 🏗️ Infrastructure (Phase 6)

- [ ] Webhook system (external event handling)
- [ ] CDN optimization (static assets, edge delivery)
- [ ] Monitoring dashboard (uptime, performance, errors)
- [ ] Secrets encryption (comprehensive key management)

### 🚀 Long-Term Vision

- [ ] AI-native Web3 university (structured degree programs)
- [ ] Autonomous AI learning agents (personal tutors)
- [ ] AI crypto portfolio assistant (investment guidance)
- [ ] AI-powered research terminal (deep analysis tools)
- [ ] Decentralized AI infrastructure (on-chain compute)
- [ ] Multi-agent AI workflows (agent orchestration)
- [ ] AI creator economy tools (content monetization)

---

## 📊 Summary

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 High (Pre-Launch) | 12 | Performance + Testing |
| 🟠 Medium (Post-Launch) | 5 | Growth + Monetization |
| 🟢 Low (Future) | 16 | Community + Infra + Vision |
| **Total** | **33** | |

---

## 🎯 Next Steps (Recommended)

1. **Performance Audit** — Lighthouse baseline, bundle optimization
2. **Testing** — Unit tests untuk critical lib files
3. **Discord/Telegram** — Growth channels
4. **Monetization** — Sponsored placements
5. **Community** — Author profiles, reputation system
