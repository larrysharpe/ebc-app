-- CreateTable
CREATE TABLE "ChoirDirectorSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "defaultChoirGroup" TEXT NOT NULL DEFAULT 'senior',
    "practiceWeekday" INTEGER NOT NULL DEFAULT 6,
    "practiceStartTime" TEXT NOT NULL DEFAULT '09:00',
    "practiceEndTime" TEXT NOT NULL DEFAULT '11:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChoirDirectorSettings_pkey" PRIMARY KEY ("id")
);
