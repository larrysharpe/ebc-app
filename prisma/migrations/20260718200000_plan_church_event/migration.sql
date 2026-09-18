-- AlterTable
ALTER TABLE "ServiceMusicPlan" ADD COLUMN "churchEventId" TEXT;

-- CreateIndex
CREATE INDEX "ServiceMusicPlan_churchEventId_idx" ON "ServiceMusicPlan"("churchEventId");

-- AddForeignKey
ALTER TABLE "ServiceMusicPlan" ADD CONSTRAINT "ServiceMusicPlan_churchEventId_fkey" FOREIGN KEY ("churchEventId") REFERENCES "ChurchEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
