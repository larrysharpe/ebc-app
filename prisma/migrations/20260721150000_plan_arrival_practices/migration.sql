-- AlterTable
ALTER TABLE "ServiceMusicPlan" ADD COLUMN "arrivalTime" TEXT;
ALTER TABLE "ServiceMusicPlan" ADD COLUMN "practices" JSONB NOT NULL DEFAULT '[]';
