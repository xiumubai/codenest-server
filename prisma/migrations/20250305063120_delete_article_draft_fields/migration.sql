/*
  Warnings:

  - You are about to drop the column `draftId` on the `Article` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Article` DROP FOREIGN KEY `Article_draftId_fkey`;

-- DropIndex
DROP INDEX `Article_draftId_key` ON `Article`;

-- AlterTable
ALTER TABLE `Article` DROP COLUMN `draftId`;
