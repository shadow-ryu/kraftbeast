-- AlterTable
ALTER TABLE "User" ADD COLUMN     "githubAppConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "githubInstallationId" TEXT;
