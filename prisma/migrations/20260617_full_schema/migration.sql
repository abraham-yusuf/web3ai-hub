warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

Loaded Prisma config from prisma.config.ts.

warn The Prisma config file in prisma.config.ts overrides the deprecated `package.json#prisma` property in package.json.
  For more information, see: https://pris.ly/prisma-config

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."PricingType" AS ENUM ('FREE', 'FREEMIUM', 'PAID', 'SUBSCRIPTION');

-- CreateEnum
CREATE TYPE "public"."ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."PostStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."AirdropStatus" AS ENUM ('ACTIVE', 'UPCOMING', 'ENDED');

-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'SCAM');

-- CreateEnum
CREATE TYPE "public"."AirdropAlertType" AS ENUM ('DEADLINE', 'STATUS_CHANGE', 'NEW_INFO', 'REMINDER');

-- CreateEnum
CREATE TYPE "public"."TrackType" AS ENUM ('WEB3', 'AI');

-- CreateEnum
CREATE TYPE "public"."AchievementTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "image" TEXT,
    "bio" TEXT,
    "twitter" TEXT,
    "github" TEXT,
    "linkedin" TEXT,
    "telegram" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRoadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoadmapStep" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'content',
    "pageSlug" TEXT,
    "estimatedTime" TEXT,
    "milestone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."PostStatus" NOT NULL DEFAULT 'DRAFT',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "language" TEXT NOT NULL DEFAULT 'id',
    "englishVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "similarityOverrideReason" TEXT,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostRevision" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "reason" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostView" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "referrer" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "device" TEXT,
    "readingTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostAuthor" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'co-author',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostAuthor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Airdrop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "network" TEXT NOT NULL,
    "status" "public"."AirdropStatus" NOT NULL DEFAULT 'ACTIVE',
    "estimatedReward" TEXT,
    "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "deadline" TIMESTAMP(3),
    "content" TEXT NOT NULL,
    "steps" JSONB,
    "requirements" TEXT[],
    "links" JSONB,
    "priceUsd" TEXT,
    "marketCap" TEXT,
    "launchDate" TIMESTAMP(3),
    "telegramUrl" TEXT,
    "twitterUrl" TEXT,
    "websiteUrl" TEXT,
    "whitepaperUrl" TEXT,
    "riskLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Airdrop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AirdropAlert" (
    "id" TEXT NOT NULL,
    "airdropId" TEXT NOT NULL,
    "type" "public"."AirdropAlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AirdropAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AirdropReview" (
    "id" TEXT NOT NULL,
    "airdropId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "riskScore" INTEGER,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AirdropReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AirdropRiskScore" (
    "id" TEXT NOT NULL,
    "airdropId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "factors" JSONB,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AirdropRiskScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AITool" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "logo" TEXT,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pricing" TEXT NOT NULL,
    "pricingType" "public"."PricingType" NOT NULL DEFAULT 'FREE',
    "pricingMin" DOUBLE PRECISION,
    "websiteUrl" TEXT,
    "features" TEXT[],
    "integrations" TEXT[],
    "languages" TEXT[],
    "platforms" TEXT[],
    "hasFreeTrial" BOOLEAN NOT NULL DEFAULT false,
    "hasApiAccess" BOOLEAN NOT NULL DEFAULT false,
    "hasMobileApp" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sponsored" BOOLEAN NOT NULL DEFAULT false,
    "affiliateLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AITool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ToolReview" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT NOT NULL DEFAULT 'Anonymous',
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ToolBookmark" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ToolCollection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ToolCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ToolCollectionItem" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolCollectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AffiliateClick" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LearnTrack" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."TrackType" NOT NULL DEFAULT 'WEB3',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LearnSection" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "trackId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LearnPage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sectionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LearnProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearnProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Flashcard" (
    "id" TEXT NOT NULL,
    "pageSlug" TEXT NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "aiProviders" JSONB,
    "adSenseConfig" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminActivity" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TopicCluster" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "keywords" TEXT[],
    "pillarPages" TEXT[],
    "relatedUrls" JSONB,
    "searchVolume" INTEGER,
    "difficulty" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicCluster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GlossaryEntry" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "example" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "language" TEXT NOT NULL DEFAULT 'id',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlossaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SeoScore" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entitySlug" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "factors" JSONB,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "language" TEXT NOT NULL DEFAULT 'id',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AirdropTask" (
    "id" TEXT NOT NULL,
    "airdropId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AirdropTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserXP" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserXP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAirdropProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "airdropId" TEXT NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "tasksDone" INTEGER NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAirdropProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "airdropId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NotificationSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "airdropId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT,
    "telegram" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Achievement" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "tier" "public"."AchievementTier" NOT NULL DEFAULT 'BRONZE',
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "trigger" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpAwarded" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT,
    "code" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "xpBonusAwarded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DailyActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "actions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "UserRoadmap_userId_idx" ON "public"."UserRoadmap"("userId");

-- CreateIndex
CREATE INDEX "RoadmapStep_roadmapId_idx" ON "public"."RoadmapStep"("roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "public"."Post"("slug");

-- CreateIndex
CREATE INDEX "Post_slug_idx" ON "public"."Post"("slug");

-- CreateIndex
CREATE INDEX "Post_category_idx" ON "public"."Post"("category");

-- CreateIndex
CREATE INDEX "Post_status_idx" ON "public"."Post"("status");

-- CreateIndex
CREATE INDEX "Post_scheduledFor_idx" ON "public"."Post"("scheduledFor");

-- CreateIndex
CREATE INDEX "Post_language_idx" ON "public"."Post"("language");

-- CreateIndex
CREATE INDEX "PostRevision_postId_version_idx" ON "public"."PostRevision"("postId", "version");

-- CreateIndex
CREATE INDEX "PostRevision_postId_createdAt_idx" ON "public"."PostRevision"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "PostView_postId_createdAt_idx" ON "public"."PostView"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "PostView_slug_createdAt_idx" ON "public"."PostView"("slug", "createdAt");

-- CreateIndex
CREATE INDEX "PostView_createdAt_idx" ON "public"."PostView"("createdAt");

-- CreateIndex
CREATE INDEX "PostAuthor_userId_idx" ON "public"."PostAuthor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostAuthor_postId_userId_key" ON "public"."PostAuthor"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Airdrop_slug_key" ON "public"."Airdrop"("slug");

-- CreateIndex
CREATE INDEX "Airdrop_slug_idx" ON "public"."Airdrop"("slug");

-- CreateIndex
CREATE INDEX "Airdrop_status_idx" ON "public"."Airdrop"("status");

-- CreateIndex
CREATE INDEX "AirdropAlert_airdropId_idx" ON "public"."AirdropAlert"("airdropId");

-- CreateIndex
CREATE INDEX "AirdropReview_airdropId_idx" ON "public"."AirdropReview"("airdropId");

-- CreateIndex
CREATE UNIQUE INDEX "AirdropReview_airdropId_userId_key" ON "public"."AirdropReview"("airdropId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "AirdropRiskScore_airdropId_key" ON "public"."AirdropRiskScore"("airdropId");

-- CreateIndex
CREATE INDEX "AirdropRiskScore_airdropId_idx" ON "public"."AirdropRiskScore"("airdropId");

-- CreateIndex
CREATE UNIQUE INDEX "AITool_slug_key" ON "public"."AITool"("slug");

-- CreateIndex
CREATE INDEX "AITool_slug_idx" ON "public"."AITool"("slug");

-- CreateIndex
CREATE INDEX "AITool_category_idx" ON "public"."AITool"("category");

-- CreateIndex
CREATE INDEX "AITool_rating_idx" ON "public"."AITool"("rating");

-- CreateIndex
CREATE INDEX "AITool_viewCount_idx" ON "public"."AITool"("viewCount");

-- CreateIndex
CREATE INDEX "ToolReview_toolId_rating_idx" ON "public"."ToolReview"("toolId", "rating");

-- CreateIndex
CREATE INDEX "ToolReview_toolId_status_idx" ON "public"."ToolReview"("toolId", "status");

-- CreateIndex
CREATE INDEX "ToolBookmark_userId_idx" ON "public"."ToolBookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ToolBookmark_toolId_userId_key" ON "public"."ToolBookmark"("toolId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ToolCollection_slug_key" ON "public"."ToolCollection"("slug");

-- CreateIndex
CREATE INDEX "ToolCollection_slug_idx" ON "public"."ToolCollection"("slug");

-- CreateIndex
CREATE INDEX "ToolCollectionItem_collectionId_idx" ON "public"."ToolCollectionItem"("collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "ToolCollectionItem_collectionId_toolId_key" ON "public"."ToolCollectionItem"("collectionId", "toolId");

-- CreateIndex
CREATE INDEX "AffiliateClick_toolId_createdAt_idx" ON "public"."AffiliateClick"("toolId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LearnTrack_slug_key" ON "public"."LearnTrack"("slug");

-- CreateIndex
CREATE INDEX "LearnTrack_slug_idx" ON "public"."LearnTrack"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LearnPage_slug_key" ON "public"."LearnPage"("slug");

-- CreateIndex
CREATE INDEX "LearnPage_slug_idx" ON "public"."LearnPage"("slug");

-- CreateIndex
CREATE INDEX "LearnProgress_pageSlug_idx" ON "public"."LearnProgress"("pageSlug");

-- CreateIndex
CREATE UNIQUE INDEX "LearnProgress_userId_pageSlug_key" ON "public"."LearnProgress"("userId", "pageSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_pageSlug_key" ON "public"."Quiz"("pageSlug");

-- CreateIndex
CREATE INDEX "Flashcard_pageSlug_idx" ON "public"."Flashcard"("pageSlug");

-- CreateIndex
CREATE INDEX "AdminActivity_actorId_idx" ON "public"."AdminActivity"("actorId");

-- CreateIndex
CREATE INDEX "AdminActivity_resource_resourceId_idx" ON "public"."AdminActivity"("resource", "resourceId");

-- CreateIndex
CREATE INDEX "AdminActivity_createdAt_idx" ON "public"."AdminActivity"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TopicCluster_topic_key" ON "public"."TopicCluster"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "TopicCluster_slug_key" ON "public"."TopicCluster"("slug");

-- CreateIndex
CREATE INDEX "TopicCluster_slug_idx" ON "public"."TopicCluster"("slug");

-- CreateIndex
CREATE INDEX "TopicCluster_topic_idx" ON "public"."TopicCluster"("topic");

-- CreateIndex
CREATE UNIQUE INDEX "GlossaryEntry_slug_key" ON "public"."GlossaryEntry"("slug");

-- CreateIndex
CREATE INDEX "GlossaryEntry_slug_idx" ON "public"."GlossaryEntry"("slug");

-- CreateIndex
CREATE INDEX "GlossaryEntry_language_idx" ON "public"."GlossaryEntry"("language");

-- CreateIndex
CREATE INDEX "GlossaryEntry_category_idx" ON "public"."GlossaryEntry"("category");

-- CreateIndex
CREATE INDEX "SeoScore_entityType_idx" ON "public"."SeoScore"("entityType");

-- CreateIndex
CREATE UNIQUE INDEX "SeoScore_entityType_entitySlug_key" ON "public"."SeoScore"("entityType", "entitySlug");

-- CreateIndex
CREATE UNIQUE INDEX "Faq_slug_key" ON "public"."Faq"("slug");

-- CreateIndex
CREATE INDEX "Faq_slug_idx" ON "public"."Faq"("slug");

-- CreateIndex
CREATE INDEX "Faq_language_idx" ON "public"."Faq"("language");

-- CreateIndex
CREATE INDEX "Faq_category_idx" ON "public"."Faq"("category");

-- CreateIndex
CREATE INDEX "AirdropTask_airdropId_idx" ON "public"."AirdropTask"("airdropId");

-- CreateIndex
CREATE INDEX "AirdropTask_userId_idx" ON "public"."AirdropTask"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserXP_userId_key" ON "public"."UserXP"("userId");

-- CreateIndex
CREATE INDEX "UserXP_userId_idx" ON "public"."UserXP"("userId");

-- CreateIndex
CREATE INDEX "UserXP_totalXp_idx" ON "public"."UserXP"("totalXp");

-- CreateIndex
CREATE INDEX "UserAirdropProgress_userId_idx" ON "public"."UserAirdropProgress"("userId");

-- CreateIndex
CREATE INDEX "UserAirdropProgress_airdropId_idx" ON "public"."UserAirdropProgress"("airdropId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAirdropProgress_userId_airdropId_key" ON "public"."UserAirdropProgress"("userId", "airdropId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "NotificationSubscription_userId_idx" ON "public"."NotificationSubscription"("userId");

-- CreateIndex
CREATE INDEX "NotificationSubscription_airdropId_idx" ON "public"."NotificationSubscription"("airdropId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationSubscription_userId_airdropId_type_key" ON "public"."NotificationSubscription"("userId", "airdropId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_slug_key" ON "public"."Achievement"("slug");

-- CreateIndex
CREATE INDEX "Achievement_slug_idx" ON "public"."Achievement"("slug");

-- CreateIndex
CREATE INDEX "Achievement_trigger_idx" ON "public"."Achievement"("trigger");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "public"."UserAchievement"("userId");

-- CreateIndex
CREATE INDEX "UserAchievement_achievementId_idx" ON "public"."UserAchievement"("achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_userId_achievementId_key" ON "public"."UserAchievement"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_userId_key" ON "public"."Streak"("userId");

-- CreateIndex
CREATE INDEX "Streak_userId_idx" ON "public"."Streak"("userId");

-- CreateIndex
CREATE INDEX "Streak_currentStreak_idx" ON "public"."Streak"("currentStreak");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_code_key" ON "public"."Referral"("code");

-- CreateIndex
CREATE INDEX "Referral_referrerId_idx" ON "public"."Referral"("referrerId");

-- CreateIndex
CREATE INDEX "Referral_refereeId_idx" ON "public"."Referral"("refereeId");

-- CreateIndex
CREATE INDEX "Referral_code_idx" ON "public"."Referral"("code");

-- CreateIndex
CREATE INDEX "DailyActivity_userId_idx" ON "public"."DailyActivity"("userId");

-- CreateIndex
CREATE INDEX "DailyActivity_date_idx" ON "public"."DailyActivity"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyActivity_userId_date_key" ON "public"."DailyActivity"("userId", "date");

-- AddForeignKey
ALTER TABLE "public"."UserRoadmap" ADD CONSTRAINT "UserRoadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RoadmapStep" ADD CONSTRAINT "RoadmapStep_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "public"."UserRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostRevision" ADD CONSTRAINT "PostRevision_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostRevision" ADD CONSTRAINT "PostRevision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostView" ADD CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostView" ADD CONSTRAINT "PostView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostAuthor" ADD CONSTRAINT "PostAuthor_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostAuthor" ADD CONSTRAINT "PostAuthor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AirdropAlert" ADD CONSTRAINT "AirdropAlert_airdropId_fkey" FOREIGN KEY ("airdropId") REFERENCES "public"."Airdrop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AirdropReview" ADD CONSTRAINT "AirdropReview_airdropId_fkey" FOREIGN KEY ("airdropId") REFERENCES "public"."Airdrop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AirdropRiskScore" ADD CONSTRAINT "AirdropRiskScore_airdropId_fkey" FOREIGN KEY ("airdropId") REFERENCES "public"."Airdrop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ToolReview" ADD CONSTRAINT "ToolReview_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "public"."AITool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ToolBookmark" ADD CONSTRAINT "ToolBookmark_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "public"."AITool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ToolCollectionItem" ADD CONSTRAINT "ToolCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "public"."ToolCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ToolCollectionItem" ADD CONSTRAINT "ToolCollectionItem_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "public"."AITool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AffiliateClick" ADD CONSTRAINT "AffiliateClick_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "public"."AITool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LearnSection" ADD CONSTRAINT "LearnSection_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."LearnTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LearnPage" ADD CONSTRAINT "LearnPage_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."LearnSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LearnProgress" ADD CONSTRAINT "LearnProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserXP" ADD CONSTRAINT "UserXP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "public"."Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Streak" ADD CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Referral" ADD CONSTRAINT "Referral_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DailyActivity" ADD CONSTRAINT "DailyActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

