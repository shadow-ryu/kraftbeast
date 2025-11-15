-- AlterTable
ALTER TABLE "Repo" ADD COLUMN     "languages" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultRepoView" TEXT NOT NULL DEFAULT 'readme';
