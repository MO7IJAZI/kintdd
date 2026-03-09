-- AlterTable
ALTER TABLE `blog_posts` ADD COLUMN `author_ar` VARCHAR(191) NULL,
    ADD COLUMN `tags_ar` TEXT NULL;

-- AlterTable
ALTER TABLE `catalogs` ADD COLUMN `fileUrl_ar` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `crops` ADD COLUMN `pdfUrl_ar` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `downloads` ADD COLUMN `fileUrl_ar` VARCHAR(191) NULL,
    ADD COLUMN `title_ar` VARCHAR(191) NULL;
