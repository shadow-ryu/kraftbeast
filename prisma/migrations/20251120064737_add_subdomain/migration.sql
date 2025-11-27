/*
  Warnings:

  - A unique constraint covering the columns `[subdomain]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subdomain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_subdomain_key" ON "User"("subdomain");
