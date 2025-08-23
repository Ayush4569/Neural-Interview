-- CreateEnum
CREATE TYPE "public"."Provider" AS ENUM ('local', 'google', 'github', 'discord');

-- CreateEnum
CREATE TYPE "public"."Experience" AS ENUM ('fresher', 'mid', 'lead', 'junior', 'senior');

-- CreateEnum
CREATE TYPE "public"."InterviewStatus" AS ENUM ('scheduled', 'completed', 'active', 'expired');

-- CreateEnum
CREATE TYPE "public"."VapiSessionStatus" AS ENUM ('active', 'failed', 'pending', 'completed');

-- CreateEnum
CREATE TYPE "public"."SummaryStatus" AS ENUM ('processing', 'pending', 'completed', 'failed');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "avatar" TEXT,
    "provider" TEXT DEFAULT 'local',
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Interview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "techStack" TEXT[],
    "durationMinutes" INTEGER NOT NULL,
    "expLevel" "public"."Experience" NOT NULL DEFAULT 'fresher',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."InterviewStatus" NOT NULL DEFAULT 'scheduled',
    "jobTitle" TEXT NOT NULL,
    "additionalPrompt" TEXT,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VapiSession" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "vapiCallId" TEXT NOT NULL,
    "vapiSessionUrl" TEXT NOT NULL,
    "status" "public"."VapiSessionStatus" NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VapiSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Summary" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "overallSummary" TEXT NOT NULL,
    "strengths" TEXT[],
    "improvements" TEXT[],
    "technicalScore" INTEGER,
    "communicationScore" INTEGER,
    "status" "public"."SummaryStatus" NOT NULL DEFAULT 'processing',
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Summary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Interview_userId_status_idx" ON "public"."Interview"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "VapiSession_interviewId_key" ON "public"."VapiSession"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "VapiSession_vapiCallId_key" ON "public"."VapiSession"("vapiCallId");

-- CreateIndex
CREATE UNIQUE INDEX "VapiSession_vapiSessionUrl_key" ON "public"."VapiSession"("vapiSessionUrl");

-- CreateIndex
CREATE INDEX "VapiSession_vapiCallId_idx" ON "public"."VapiSession"("vapiCallId");

-- CreateIndex
CREATE INDEX "VapiSession_status_idx" ON "public"."VapiSession"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Summary_interviewId_key" ON "public"."Summary"("interviewId");

-- CreateIndex
CREATE INDEX "Summary_status_idx" ON "public"."Summary"("status");

-- AddForeignKey
ALTER TABLE "public"."Interview" ADD CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VapiSession" ADD CONSTRAINT "VapiSession_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Summary" ADD CONSTRAINT "Summary_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
