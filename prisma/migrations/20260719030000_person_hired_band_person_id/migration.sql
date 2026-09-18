-- AlterTable
ALTER TABLE "BandMusician" ADD COLUMN IF NOT EXISTS "personId" TEXT;

CREATE INDEX IF NOT EXISTS "BandMusician_personId_idx" ON "BandMusician"("personId");
