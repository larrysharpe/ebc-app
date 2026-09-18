-- AlterTable
ALTER TABLE "NotificationChannelPreference" ADD COLUMN "smsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "NotificationTopicPreference" ADD COLUMN "smsEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Opt existing choir plan topics into text (matches defaultSms for those topics).
UPDATE "NotificationTopicPreference"
SET "smsEnabled" = true
WHERE topic IN ('music.plan.shared', 'music.plan.updated');

-- Master text channel on for users who already saved channel prefs.
UPDATE "NotificationChannelPreference"
SET "smsEnabled" = true;
