-- AlterTable
ALTER TABLE `blog_posts` ADD COLUMN `content_ar` LONGTEXT NULL,
    ADD COLUMN `excerpt_ar` TEXT NULL,
    ADD COLUMN `metaDesc_ar` TEXT NULL,
    ADD COLUMN `metaTitle_ar` VARCHAR(191) NULL,
    ADD COLUMN `title_ar` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `categories` ADD COLUMN `description_ar` TEXT NULL,
    ADD COLUMN `name_ar` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `certificates` ADD COLUMN `description_ar` TEXT NULL,
    ADD COLUMN `title_ar` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `crop_stages` ADD COLUMN `name_ar` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `crops` ADD COLUMN `description_ar` TEXT NULL,
    ADD COLUMN `harvestSeason_ar` VARCHAR(191) NULL,
    ADD COLUMN `metaTitle_ar` VARCHAR(191) NULL,
    ADD COLUMN `name_ar` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `expert_articles` ADD COLUMN `content_ar` LONGTEXT NULL,
    ADD COLUMN `excerpt_ar` TEXT NULL,
    ADD COLUMN `metaDesc_ar` TEXT NULL,
    ADD COLUMN `metaTitle_ar` VARCHAR(191) NULL,
    ADD COLUMN `title_ar` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `job_offers` ADD COLUMN `benefits_ar` TEXT NULL,
    ADD COLUMN `companyIntro_ar` TEXT NULL,
    ADD COLUMN `contractType_ar` VARCHAR(191) NULL,
    ADD COLUMN `employmentType_ar` VARCHAR(191) NULL,
    ADD COLUMN `location_ar` VARCHAR(191) NULL,
    ADD COLUMN `qualifications_ar` TEXT NULL,
    ADD COLUMN `responsibilities_ar` TEXT NULL,
    ADD COLUMN `title_ar` VARCHAR(191) NULL,
    ADD COLUMN `workType_ar` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `pages` ADD COLUMN `content_ar` LONGTEXT NULL,
    ADD COLUMN `title_ar` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `benefits_ar` TEXT NULL,
    ADD COLUMN `compTable_ar` JSON NULL,
    ADD COLUMN `composition_ar` TEXT NULL,
    ADD COLUMN `description_ar` TEXT NULL,
    ADD COLUMN `features_ar` TEXT NULL,
    ADD COLUMN `metaDesc_ar` TEXT NULL,
    ADD COLUMN `metaTitle_ar` VARCHAR(191) NULL,
    ADD COLUMN `name_ar` VARCHAR(191) NULL,
    ADD COLUMN `shortDesc_ar` TEXT NULL,
    ADD COLUMN `tabs` JSON NULL,
    ADD COLUMN `tabs_ar` JSON NULL,
    ADD COLUMN `usageTable_ar` JSON NULL,
    ADD COLUMN `usage_ar` TEXT NULL;

-- CreateTable
CREATE TABLE `headquarters` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Company Headquarter',
    `title_ar` VARCHAR(191) NULL DEFAULT 'مقر الشركة',
    `content` TEXT NULL,
    `content_ar` TEXT NULL,
    `address` VARCHAR(191) NULL,
    `address_ar` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `awards` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `title_ar` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `description_ar` TEXT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `awards_order_idx`(`order`),
    INDEX `awards_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
