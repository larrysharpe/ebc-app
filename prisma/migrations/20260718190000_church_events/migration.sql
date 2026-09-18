-- CreateTable
CREATE TABLE "ChurchEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "eventDate" TEXT NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "recurring" TEXT,
    "eventType" TEXT NOT NULL DEFAULT 'other',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "ministryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChurchEvent_eventDate_idx" ON "ChurchEvent"("eventDate");

-- CreateIndex
CREATE INDEX "ChurchEvent_ministryId_idx" ON "ChurchEvent"("ministryId");

-- CreateIndex
CREATE INDEX "ChurchEvent_status_idx" ON "ChurchEvent"("status");

-- AddForeignKey
ALTER TABLE "ChurchEvent" ADD CONSTRAINT "ChurchEvent_ministryId_fkey" FOREIGN KEY ("ministryId") REFERENCES "Ministry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
