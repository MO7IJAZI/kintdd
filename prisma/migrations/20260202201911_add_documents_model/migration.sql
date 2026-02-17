-- AlterTable
ALTER TABLE `job_offers` ADD COLUMN `expiresAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `company_data` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(191) NOT NULL DEFAULT 'KINT Kafri International',
    `companyName_ar` VARCHAR(191) NULL DEFAULT 'KINT Kafri International',
    `address` TEXT NULL,
    `address_ar` TEXT NULL,
    `courtInfo` TEXT NULL,
    `courtInfo_ar` TEXT NULL,
    `ncrNumber` VARCHAR(191) NULL DEFAULT '0000100441',
    `vatNumber` VARCHAR(191) NULL DEFAULT 'PL 637-011-20-65',
    `capital` VARCHAR(191) NULL DEFAULT 'PLN 177 000',
    `capital_ar` VARCHAR(191) NULL DEFAULT 'PLN 177 000',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `title_ar` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `description_ar` TEXT NULL,
    `filePath` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `downloads` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `documents_slug_key`(`slug`),
    INDEX `documents_slug_idx`(`slug`),
    INDEX `documents_category_idx`(`category`),
    INDEX `documents_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
