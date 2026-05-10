# Web3AI Hub Launch Checklist

Use this checklist before promoting a build from staging to production.

## 1. Environment and secrets
- [ ] `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are configured for the target environment.
- [ ] Bootstrap `ADMIN_PASSWORD` is changed from the development default.
- [ ] At least one AI provider key is configured if AI Writer or Airdrop AI Helper should be enabled.
- [ ] `AI_SETTINGS_ENCRYPTION_KEY` is set before storing provider keys in admin settings.
- [ ] `NEXT_PUBLIC_APP_URL` points to the canonical production domain.

## 2. Analytics and Search Console
- [ ] GA4 web data stream is created and `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.
- [ ] Google Search Console property is created and `NEXT_PUBLIC_GSC_VERIFICATION` is set.
- [ ] Verify `page_view`, `search`, `learn_progress_toggle`, and Web Vitals events in GA4 DebugView.
- [ ] Submit `/sitemap.xml` in Google Search Console after production deploy.

## 3. SEO and content readiness
- [ ] `robots.txt` and `/sitemap.xml` return production URLs.
- [ ] Blog, Learn, Airdrop, and AI Tools detail pages have canonical metadata.
- [ ] Draft/scheduled posts are not visible publicly before their publish time.
- [ ] 404 and 500 recovery pages render with working recovery links.

## 4. Monetization and outbound tracking
- [ ] AdSense client ID and slot IDs are configured where ads should be enabled.
- [ ] Admin/editor roles do not see suppressed ad placements.
- [ ] AI tool affiliate outbound links redirect correctly and record clicks.

## 5. QA smoke test
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build` in an environment that can fetch configured fonts.
- [ ] Smoke test login, post CRUD, airdrop CRUD/bulk update, tool compare, global search, and learn progress.
