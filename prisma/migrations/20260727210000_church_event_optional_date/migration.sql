-- Allow church calendar events without a date (planning drafts).
ALTER TABLE "ChurchEvent" ALTER COLUMN "eventDate" DROP NOT NULL;
