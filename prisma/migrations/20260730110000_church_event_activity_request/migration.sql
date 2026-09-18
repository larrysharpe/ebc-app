-- Activity Request JSON + ensure campus spaceId column exists
ALTER TABLE "ChurchEvent" ADD COLUMN IF NOT EXISTS "spaceId" TEXT;
ALTER TABLE "ChurchEvent" ADD COLUMN IF NOT EXISTS "activityRequest" JSONB;

CREATE INDEX IF NOT EXISTS "ChurchEvent_spaceId_eventDate_idx"
  ON "ChurchEvent"("spaceId", "eventDate");
