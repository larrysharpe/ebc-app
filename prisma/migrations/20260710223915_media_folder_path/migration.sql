-- AlterTable
ALTER TABLE "MinistryMediaAsset" ADD COLUMN     "folderPath" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "MinistryMediaAsset_ministryId_folderPath_idx" ON "MinistryMediaAsset"("ministryId", "folderPath");
