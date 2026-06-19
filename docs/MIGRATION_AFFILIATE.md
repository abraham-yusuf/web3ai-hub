# Affiliate Optimization — Migration Notes

## New Models
- `AffiliateConversion` — tracks conversions (signup, trial, purchase) with revenue
- `AffiliateExperiment` — A/B test definitions with variant configs

## Modified Models
- `AffiliateClick` — added fields: `sessionId`, `experimentId`, `variant`, `page`

## Migration SQL

Run `npx prisma migrate dev --name affiliate_optimization` or apply manually:

```sql
-- Add new columns to AffiliateClick
ALTER TABLE "AffiliateClick" ADD COLUMN "sessionId" TEXT;
ALTER TABLE "AffiliateClick" ADD COLUMN "experimentId" TEXT;
ALTER TABLE "AffiliateClick" ADD COLUMN "variant" TEXT;
ALTER TABLE "AffiliateClick" ADD COLUMN "page" TEXT;
CREATE INDEX "AffiliateClick_experimentId_idx" ON "AffiliateClick"("experimentId");
CREATE INDEX "AffiliateClick_sessionId_idx" ON "AffiliateClick"("sessionId");

-- Create AffiliateConversion
CREATE TABLE "AffiliateConversion" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "sessionId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'signup',
    "revenue" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "externalId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AffiliateConversion_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AffiliateConversion_toolId_createdAt_idx" ON "AffiliateConversion"("toolId", "createdAt");
CREATE INDEX "AffiliateConversion_sessionId_idx" ON "AffiliateConversion"("sessionId");
ALTER TABLE "AffiliateConversion" ADD CONSTRAINT "AffiliateConversion_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "AITool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create AffiliateExperiment
CREATE TABLE "AffiliateExperiment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "targetPage" TEXT,
    "variants" JSONB NOT NULL,
    "metric" TEXT NOT NULL DEFAULT 'ctr',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AffiliateExperiment_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AffiliateExperiment_status_idx" ON "AffiliateExperiment"("status");
ALTER TABLE "AffiliateClick" ADD CONSTRAINT "AffiliateClick_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "AffiliateExperiment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```
