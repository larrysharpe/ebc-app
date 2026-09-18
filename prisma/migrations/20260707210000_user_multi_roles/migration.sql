-- Multi-role accounts: replace single role/ministryId with arrays.

ALTER TABLE "User" ADD COLUMN "roles" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ADD COLUMN "ministryIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "User"
SET
  "roles" = ARRAY["role"],
  "ministryIds" = CASE
    WHEN "ministryId" IS NOT NULL THEN ARRAY["ministryId"]
    ELSE ARRAY[]::TEXT[]
  END;

ALTER TABLE "User" ALTER COLUMN "roles" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "roles" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ALTER COLUMN "ministryIds" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "ministryIds" SET DEFAULT ARRAY[]::TEXT[];

ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" DROP COLUMN "ministryId";
