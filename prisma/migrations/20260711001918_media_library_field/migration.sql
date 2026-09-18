-- AlterTable
ALTER TABLE "MinistryMediaAsset" ADD COLUMN     "library" TEXT NOT NULL DEFAULT 'media';

-- CreateIndex
CREATE INDEX "MinistryMediaAsset_ministryId_library_idx" ON "MinistryMediaAsset"("ministryId", "library");
