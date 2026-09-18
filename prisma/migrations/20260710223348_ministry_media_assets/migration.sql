-- AlterTable
ALTER TABLE "BandMusician" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "roles" DROP DEFAULT;

-- CreateTable
CREATE TABLE "MinistryMediaAsset" (
    "id" TEXT NOT NULL,
    "ministryId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "displayName" TEXT,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'local',
    "kind" TEXT NOT NULL,
    "notes" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MinistryMediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MinistryMediaAsset_ministryId_idx" ON "MinistryMediaAsset"("ministryId");

-- CreateIndex
CREATE INDEX "MinistryMediaAsset_ministryId_kind_idx" ON "MinistryMediaAsset"("ministryId", "kind");

-- AddForeignKey
ALTER TABLE "MinistryMediaAsset" ADD CONSTRAINT "MinistryMediaAsset_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
