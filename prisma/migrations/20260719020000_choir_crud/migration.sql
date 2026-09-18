-- CreateTable
CREATE TABLE IF NOT EXISTS "Choir" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leaders" JSONB NOT NULL DEFAULT '[]',
    "defaultSunday" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Choir_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Choir_active_sortOrder_idx" ON "Choir"("active", "sortOrder");
