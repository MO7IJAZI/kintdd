-- CreateTable
CREATE TABLE `animal_type_tabs` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `title_ar` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `description_ar` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `animalTypeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `animal_type_tabs_animalTypeId_idx`(`animalTypeId`),
    INDEX `animal_type_tabs_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `animal_type_tab_images` (
    `id` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `title_ar` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `description_ar` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `tabId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `animal_type_tab_images_tabId_idx`(`tabId`),
    INDEX `animal_type_tab_images_order_idx`(`order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `animal_type_tabs` ADD CONSTRAINT `animal_type_tabs_animalTypeId_fkey` FOREIGN KEY (`animalTypeId`) REFERENCES `animal_types`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `animal_type_tab_images` ADD CONSTRAINT `animal_type_tab_images_tabId_fkey` FOREIGN KEY (`tabId`) REFERENCES `animal_type_tabs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
