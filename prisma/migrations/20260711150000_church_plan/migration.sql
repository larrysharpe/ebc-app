-- CreateTable
CREATE TABLE "ChurchPlan" (
    "id" TEXT NOT NULL,
    "suggestedPlan" TEXT,
    "suggestedPlanGeneratedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChurchPlan_pkey" PRIMARY KEY ("id")
);
