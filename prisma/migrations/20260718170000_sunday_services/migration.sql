-- CreateTable
CREATE TABLE "SundayService" (
    "id" TEXT NOT NULL,
    "serviceDate" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "characteristics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "startTime" TEXT,
    "endTime" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SundayService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SundayService_serviceDate_idx" ON "SundayService"("serviceDate");

-- CreateIndex
CREATE INDEX "SundayService_status_idx" ON "SundayService"("status");

-- AlterTable
ALTER TABLE "ServiceMusicPlan" ADD COLUMN "sundayServiceId" TEXT;

-- CreateIndex
CREATE INDEX "ServiceMusicPlan_sundayServiceId_idx" ON "ServiceMusicPlan"("sundayServiceId");

-- AddForeignKey
ALTER TABLE "ServiceMusicPlan" ADD CONSTRAINT "ServiceMusicPlan_sundayServiceId_fkey" FOREIGN KEY ("sundayServiceId") REFERENCES "SundayService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
