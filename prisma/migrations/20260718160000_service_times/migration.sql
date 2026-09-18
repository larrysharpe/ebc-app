-- AlterTable
ALTER TABLE "ServiceMusicPlan" ADD COLUMN "serviceStartTime" TEXT;
ALTER TABLE "ServiceMusicPlan" ADD COLUMN "serviceEndTime" TEXT;

-- AlterTable
ALTER TABLE "ChoirDirectorSettings" ADD COLUMN "serviceStartTime" TEXT NOT NULL DEFAULT '11:00';
ALTER TABLE "ChoirDirectorSettings" ADD COLUMN "serviceEndTime" TEXT NOT NULL DEFAULT '13:00';
