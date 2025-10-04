/*
  Warnings:

  - You are about to drop the column `assitantLock` on the `joinToken` table. All the data in the column will be lost.
  - Added the required column `assistantLock` to the `joinToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."joinToken" DROP COLUMN "assitantLock",
ADD COLUMN     "assistantLock" TEXT NOT NULL;
