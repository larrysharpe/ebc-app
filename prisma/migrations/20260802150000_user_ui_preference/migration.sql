-- CreateTable
CREATE TABLE "UserUiPreference" (
    "userId" TEXT NOT NULL,
    "voiceCoachPreference" TEXT NOT NULL DEFAULT 'ask',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserUiPreference_pkey" PRIMARY KEY ("userId")
);
