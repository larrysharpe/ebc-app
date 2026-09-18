-- AlterTable
ALTER TABLE "BandMusician" ADD COLUMN IF NOT EXISTS "secondaryInstruments" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "BandMusician" ADD COLUMN IF NOT EXISTS "depthOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "BandMusician_instrument_role_depthOrder_idx"
  ON "BandMusician"("instrument", "role", "depthOrder");
