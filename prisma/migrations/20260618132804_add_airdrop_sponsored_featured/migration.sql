-- AlterTable: add sponsored + featured fields to Airdrop (mirrors AITool pattern)
ALTER TABLE "Airdrop" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Airdrop" ADD COLUMN "sponsored" BOOLEAN NOT NULL DEFAULT false;
