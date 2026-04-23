-- AlterTable
ALTER TABLE `animal_issues` ADD COLUMN `recommendation` JSON NULL;

-- AlterTable
ALTER TABLE `animal_types` ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `category_ar` VARCHAR(191) NULL,
    ADD COLUMN `documentTitle` VARCHAR(191) NULL,
    ADD COLUMN `documentTitle_ar` VARCHAR(191) NULL,
    ADD COLUMN `metaTitle` VARCHAR(191) NULL,
    ADD COLUMN `metaTitle_ar` VARCHAR(191) NULL,
    ADD COLUMN `pdfUrl` VARCHAR(191) NULL,
    ADD COLUMN `pdfUrl_ar` VARCHAR(191) NULL,
    ADD COLUMN `productionSeason_ar` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `custom_fonts` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `custom_fonts_name_key`(`name`),
    INDEX `custom_fonts_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
