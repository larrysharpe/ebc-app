-- Structured recurrence for church calendar events.
ALTER TABLE "ChurchEvent" ADD COLUMN IF NOT EXISTS "recurrencePattern" TEXT;
ALTER TABLE "ChurchEvent" ADD COLUMN IF NOT EXISTS "seriesId" TEXT;
CREATE INDEX IF NOT EXISTS "ChurchEvent_seriesId_idx" ON "ChurchEvent"("seriesId");
