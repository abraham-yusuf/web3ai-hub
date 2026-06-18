# ⚡ Performance Audit — Web3AI Hub

> Baseline audit on **production** (`https://ai3.web.id`), measured 2026-06-18.
> Target: Lighthouse 90+ on all metrics; Core Web Vitals in "Good" range
> (LCP < 2.5s, CLS < 0.1, INP < 200ms).

This document is the deliverable for the **Performance Audit (Phase 6)** TODO block.
Metrics were captured with headless Chromium via the Chrome DevTools Protocol
(Navigation Timing + PerformanceObserver for LCP/CLS/FCP, Resource Timing for
transfer weight). Re-run methodology is documented at the bottom.

---

## 📊 Measured Baseline (production)

### Core Web Vitals — Desktop (1366×900, no throttle)

| Page | FCP | LCP | CLS | TTFB | Load |
|------|-----|-----|-----|------|------|
| Homepage | 960ms | **3072ms** ⚠️ | 0.000 ✅ | 574ms | 3046ms |
| Blog list | 672ms | 672ms ✅ | 0.000 ✅ | 381ms | 810ms |
| AI Tools | 1272ms | **4264ms** 🔴 | **0.076** ⚠️ | 504ms | 4007ms |
| Learn | 972ms | 2416ms ✅ | 0.000 ✅ | 234ms | 2374ms |
| Airdrop | 672ms | 2092ms ✅ | **0.095** ⚠️ | 436ms | 2048ms |

### Core Web Vitals — Mobile (390×844, 4× CPU throttle, Fast-3G)

| Page | FCP | LCP | CLS | TTFB | Load |
|------|-----|-----|-----|------|------|
| Homepage | 380ms | **4008ms** 🔴 | 0.000 ✅ | 199ms | 3972ms |
| Blog list | 380ms | 380ms ✅ | 0.000 ✅ | 153ms | 475ms |
| AI Tools | 760ms | **4120ms** 🔴 | **0.180** 🔴 | 152ms | 4053ms |
| Learn | 468ms | 2388ms ✅ | 0.000 ✅ | 156ms | 2259ms |
| Airdrop | 536ms | 716ms ✅ | 0.000 ✅ | 126ms | 649ms |

### Resource Weight (cold cache, homepage)

| Metric | Value |
|--------|-------|
| Total transfer (first load) | ~521 KB |
| JS transfer (first load) | ~332 KB |
| CSS transfer | ~27 KB |
| Largest JS chunk | ~72 KB |
| Requests (homepage) | 59 |
| Requests (Learn) | ~100 ⚠️ |

> ✅ Good news: shared JS chunks **cache well** across navigation — subsequent
> page loads re-use cached bundles (transferSize ≈ 0), so SPA navigation is fast.

🔴 = Poor · ⚠️ = Needs improvement · ✅ = Good

---

## 🔍 Key Findings

### 1. 🔴 AI Tools page is the worst performer (LCP ~4.2s, CLS 0.18 mobile)
**Root cause #1 — render strategy conflict.** `src/app/(public)/ai-tools/page.tsx`
declares **both**:
```ts
export const dynamic = "force-dynamic"   // forces SSR on every request
export const revalidate = 3600           // dead code — ignored under force-dynamic
```
Because the page reads `searchParams` and is `force-dynamic`, it hits the database
and server-renders on **every** request — no ISR/edge cache — which inflates LCP.
**Root cause #2 — CLS.** Layout shifts come from late-injected `AdSlot` ad blocks
and tool-card content reflowing after hydration (`view-tracker`, `bookmark-button`).

### 2. ⚠️ Homepage LCP 3.0s desktop / 4.0s mobile
LCP element renders late. Likely a hero image/heading blocked by the initial JS
chunk parse. Candidate fixes: `priority` on the LCP image, preconnect to API
origins, reduce above-the-fold client JS.

### 3. ⚠️ CLS on Airdrop (0.095 desktop) & AI Tools — ad slots + un-sized images
Found raw `<img>` tags without dimensions (now fixed in this PR). Ad slots without
reserved height are the remaining contributor.

### 4. ✅ Already in good shape
- Image optimization config solid (`next.config.ts`: AVIF/WebP, deviceSizes,
  `minimumCacheTTL` 7d, SVG disabled).
- `@next/bundle-analyzer` already wired (`npm run analyze`).
- `compiler.removeConsole` enabled for prod.
- Security headers present.
- Shared chunk caching works well.

---

## ✅ Prioritized Recommendations

### P0 — Fix AI Tools page (biggest win)
1. **Remove the dead `revalidate` / reconsider `force-dynamic`.** The filtering page
   is inherently dynamic via `searchParams`, but consider an edge-cached default
   (no-filter) view + client-side filtering, or `unstable_cache` around the Prisma
   query keyed by filters. Target LCP < 2.5s.
2. **Reserve ad-slot height** (fixed min-height container) to kill the 0.18 CLS.
3. **Add `Suspense` + skeleton** for the tool grid so the shell paints immediately.

### P1 — Homepage LCP
4. Mark the LCP hero image with `priority` and explicit dimensions.
5. `preconnect`/`dns-prefetch` to API origins (Etherscan, OpenSea, DeFiLlama, OG).
6. Audit above-the-fold client components; `next/dynamic` the non-critical ones
   (currently **0** dynamic imports in the codebase — low-hanging fruit).

### P2 — Bundle & requests
7. Run `npm run analyze` and code-split the largest chunks (72/58/41 KB). Lazy-load
   heavy client widgets (charts in web3-tools, compare table, AI chat) via
   `next/dynamic`.
8. Investigate Learn page's ~100 requests (sprite/icon consolidation, batch data).

### P3 — Data layer (N+1)
9. Enable Prisma query logging in staging and check list pages for N+1 (`include`
   vs batched). Add `select` projections to trim over-fetching on list routes.

### Done in this PR ✅
- Added explicit `width`/`height` + `loading="lazy"` + `decoding="async"` to the
  two remaining raw `<img>` tags (`defi-analytics`, `tools/import`) to cut CLS.
- Documented the measured baseline so future work is comparable.

---

## 🔁 How to re-measure

**Option A — Lighthouse (canonical, needs Node):**
```bash
npm run build && npm run start            # or test against https://ai3.web.id
npx lighthouse https://ai3.web.id --preset=desktop --view
npx lighthouse https://ai3.web.id --view  # mobile (default)
```

**Option B — Bundle analysis:**
```bash
npm run analyze        # opens treemap of client/server bundles
```

**Option C — CWV in the field:** wire `web-vitals` → existing analytics
(`/api/notifications` pattern) to capture real-user LCP/CLS/INP over time.

> Baseline captured 2026-06-18 via headless Chromium + CDP (Navigation Timing,
> PerformanceObserver, Resource Timing). Re-run after each P0/P1 fix and update the
> tables above to track progress toward the Lighthouse 90+ goal.
