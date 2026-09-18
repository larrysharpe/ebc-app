-- AlterTable
ALTER TABLE "ChoirDirectorSettings" ADD COLUMN IF NOT EXISTS "defaultRotationBySunday" JSONB;
ALTER TABLE "ChoirDirectorSettings" ADD COLUMN IF NOT EXISTS "leadersByGroup" JSONB;

-- CreateTable
CREATE TABLE IF NOT EXISTS "MusicianIntake" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "instrument" TEXT NOT NULL,
    "serviceDate" TEXT NOT NULL,
    "playerType" TEXT NOT NULL DEFAULT 'guest',
    "paymentPaperworkComplete" BOOLEAN NOT NULL DEFAULT false,
    "paymentNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "bandMusicianId" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicianIntake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MusicianIntake_serviceDate_idx" ON "MusicianIntake"("serviceDate");
CREATE INDEX IF NOT EXISTS "MusicianIntake_status_idx" ON "MusicianIntake"("status");
