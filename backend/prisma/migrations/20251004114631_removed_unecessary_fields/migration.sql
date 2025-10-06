/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `callSession` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."callSession" DROP COLUMN "expiresAt";
