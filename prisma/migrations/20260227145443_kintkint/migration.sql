/*
  Warnings:

  - You are about to drop the column `locale` on the `catalogs` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `catalogs_locale_idx` ON `catalogs`;

-- AlterTable
ALTER TABLE `catalogs` DROP COLUMN `locale`;
