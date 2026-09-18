-- AlterTable
ALTER TABLE "ChoirDirectorSettings" ADD COLUMN "defaultServiceSlots" JSONB NOT NULL DEFAULT '["welcome","worship","congregational_hymn","offering","sermonic","response","last_song"]';
