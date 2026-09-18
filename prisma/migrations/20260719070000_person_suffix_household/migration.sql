-- AlterTable
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "suffix" TEXT;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "dateOfBirth" TEXT;
ALTER TABLE "Person" ADD COLUMN IF NOT EXISTS "isMinor" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Person_isMinor_idx" ON "Person"("isMinor");

-- CreateTable
CREATE TABLE IF NOT EXISTS "Household" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "primaryPhone" TEXT,
    "primaryEmail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PersonHousehold" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonHousehold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PersonHousehold_personId_key" ON "PersonHousehold"("personId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PersonHousehold_householdId_idx" ON "PersonHousehold"("householdId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PersonHousehold_role_idx" ON "PersonHousehold"("role");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PersonHousehold_householdId_personId_key" ON "PersonHousehold"("householdId", "personId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "PersonHousehold" ADD CONSTRAINT "PersonHousehold_householdId_fkey"
    FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "PersonHousehold" ADD CONSTRAINT "PersonHousehold_personId_fkey"
    FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
