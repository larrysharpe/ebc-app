-- CreateTable
CREATE TABLE "Ministry" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "meetingSummary" TEXT,
    "personnel" JSONB NOT NULL DEFAULT '[]',
    "events" JSONB NOT NULL DEFAULT '[]',
    "sops" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ministry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SopConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "sections" JSONB NOT NULL,
    "templates" JSONB NOT NULL,
    "categoryDefaults" JSONB NOT NULL,
    "minQualityScore" INTEGER NOT NULL DEFAULT 70,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SopConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "youtubeUrl" TEXT,
    "defaultKey" TEXT,
    "themes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "lyricsText" TEXT,
    "copyrightNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceMusicPlan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "choirGroup" TEXT NOT NULL,
    "serviceDate" TEXT NOT NULL,
    "sundayOfMonth" INTEGER,
    "scheduleOverride" BOOLEAN NOT NULL DEFAULT false,
    "scheduleNote" TEXT,
    "practiceDate" TEXT,
    "practiceStartTime" TEXT,
    "practiceEndTime" TEXT,
    "practiceLocation" TEXT,
    "occasion" TEXT,
    "attire" TEXT,
    "scriptureReader" TEXT,
    "prayerLeader" TEXT,
    "directorNotes" TEXT,
    "postServiceMessage" TEXT,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "directorName" TEXT NOT NULL,
    "songs" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceMusicPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChoirScheduleOverride" (
    "id" TEXT NOT NULL,
    "serviceDate" TEXT NOT NULL,
    "choirGroup" TEXT NOT NULL,
    "sundayOfMonth" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "ChoirScheduleOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BandMusician" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instrument" TEXT NOT NULL,
    "sundays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "everyOther2nd" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL,
    "namePending" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "BandMusician_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ministry_slug_key" ON "Ministry"("slug");
