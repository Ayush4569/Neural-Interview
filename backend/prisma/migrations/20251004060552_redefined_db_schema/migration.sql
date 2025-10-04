/*
  Warnings:

  - You are about to drop the `VapiSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."CallSessionStatus" AS ENUM ('active', 'failed', 'pending', 'completed');

-- DropForeignKey
ALTER TABLE "public"."VapiSession" DROP CONSTRAINT "VapiSession_interviewId_fkey";

-- DropTable
DROP TABLE "public"."VapiSession";

-- DropEnum
DROP TYPE "public"."Provider";

-- DropEnum
DROP TYPE "public"."VapiSessionStatus";

-- CreateTable
CREATE TABLE "public"."callSession" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "vapiCallId" TEXT,
    "totalSecondsElapsed" INTEGER DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3),
    "status" "public"."CallSessionStatus" NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "callSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."joinToken" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assitantLock" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "consumedCount" INTEGER NOT NULL DEFAULT 0,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "serverNonce" TEXT NOT NULL,
    "firstConsumedCallId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "joinToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "callSession_interviewId_key" ON "public"."callSession"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "callSession_vapiCallId_key" ON "public"."callSession"("vapiCallId");

-- CreateIndex
CREATE INDEX "callSession_status_idx" ON "public"."callSession"("status");

-- AddForeignKey
ALTER TABLE "public"."callSession" ADD CONSTRAINT "callSession_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
