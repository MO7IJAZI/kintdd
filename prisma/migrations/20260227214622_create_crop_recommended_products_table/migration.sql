/*
  Warnings:

  - You are about to drop the column `locale` on the `catalogs` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `catalogs_locale_idx` ON `catalogs`;

-- AlterTable
ALTER TABLE `catalogs` DROP COLUMN `locale`;

-- CreateTable
CREATE TABLE `_AnimalTypeToProduct` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_AnimalTypeToProduct_AB_unique`(`A`, `B`),
    INDEX `_AnimalTypeToProduct_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_AnimalTypeToProduct` ADD CONSTRAINT `_AnimalTypeToProduct_A_fkey` FOREIGN KEY (`A`) REFERENCES `animal_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AnimalTypeToProduct` ADD CONSTRAINT `_AnimalTypeToProduct_B_fkey` FOREIGN KEY (`B`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
