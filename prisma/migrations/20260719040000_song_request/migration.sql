-- CreateTable
CREATE TABLE IF NOT EXISTS "SongRequest" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "youtubeUrl" TEXT,
    "audioUrl" TEXT,
    "defaultKey" TEXT,
    "themes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedById" TEXT,
    "requestedByName" TEXT,
    "songId" TEXT,
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SongRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SongRequest_status_idx" ON "SongRequest"("status");
CREATE INDEX IF NOT EXISTS "SongRequest_createdAt_idx" ON "SongRequest"("createdAt");
