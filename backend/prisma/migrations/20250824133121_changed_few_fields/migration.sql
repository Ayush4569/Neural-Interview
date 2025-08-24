/*
  Warnings:

  - The values [junior] on the enum `Experience` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Experience_new" AS ENUM ('fresher', 'mid', 'lead', 'senior');
ALTER TABLE "public"."Interview" ALTER COLUMN "expLevel" DROP DEFAULT;
ALTER TABLE "public"."Interview" ALTER COLUMN "expLevel" TYPE "public"."Experience_new" USING ("expLevel"::text::"public"."Experience_new");
ALTER TYPE "public"."Experience" RENAME TO "Experience_old";
ALTER TYPE "public"."Experience_new" RENAME TO "Experience";
DROP TYPE "public"."Experience_old";
ALTER TABLE "public"."Interview" ALTER COLUMN "expLevel" SET DEFAULT 'fresher';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Interview" ALTER COLUMN "techStack" SET NOT NULL,
ALTER COLUMN "techStack" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "username";
