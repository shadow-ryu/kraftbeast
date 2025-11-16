-- DropIndex
DROP INDEX "Timeline_userId_repoName_timestamp_key";

-- AlterTable
ALTER TABLE "Repo" ADD COLUMN     "isFork" BOOLEAN NOT NULL DEFAULT false;
