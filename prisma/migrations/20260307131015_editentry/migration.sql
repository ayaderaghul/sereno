/*
  Warnings:

  - You are about to drop the column `source_title` on the `Entry` table. All the data in the column will be lost.
  - You are about to drop the column `source_url` on the `Entry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Entry" DROP COLUMN "source_title",
DROP COLUMN "source_url",
ADD COLUMN     "suggestions" TEXT;
