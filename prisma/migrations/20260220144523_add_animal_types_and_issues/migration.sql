-- AlterTable
ALTER TABLE `categories` ADD COLUMN `icon` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `crop_stages` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `description_ar` TEXT NULL;

-- AlterTable
ALTER TABLE `crops` ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `category_ar` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `animal_types` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `name_ar` VARCHAR(191) NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `description_ar` TEXT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `animal_types_slug_key`(`slug`),
    INDEX `animal_types_slug_idx`(`slug`),
    INDEX `animal_types_isActive_idx`(`isActive`),
    INDEX `animal_types_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `animal_issues` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `title_ar` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `description_ar` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `animalTypeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `animal_issues_animalTypeId_idx`(`animalTypeId`),
    INDEX `animal_issues_isActive_idx`(`isActive`),
    INDEX `animal_issues_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `crops_category_idx` ON `crops`(`category`);

-- AddForeignKey
ALTER TABLE `animal_issues` ADD CONSTRAINT `animal_issues_animalTypeId_fkey` FOREIGN KEY (`animalTypeId`) REFERENCES `animal_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
