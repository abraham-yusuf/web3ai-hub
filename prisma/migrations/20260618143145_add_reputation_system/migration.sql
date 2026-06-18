-- CreateEnum
CREATE TYPE "TrustLevel" AS ENUM ('NEWCOMER', 'CONTRIBUTOR', 'TRUSTED', 'EXPERT', 'GUARDIAN');

-- AlterTable: add reputation fields to UserXP
ALTER TABLE "UserXP" ADD COLUMN "reputation" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "UserXP" ADD COLUMN "trustLevel" "TrustLevel" NOT NULL DEFAULT 'NEWCOMER';

-- CreateIndex
CREATE INDEX "UserXP_reputation_idx" ON "UserXP"("reputation");

-- CreateTable
CREATE TABLE "ReputationEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReputationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReputationEvent_userId_idx" ON "ReputationEvent"("userId");
CREATE INDEX "ReputationEvent_createdAt_idx" ON "ReputationEvent"("createdAt");
