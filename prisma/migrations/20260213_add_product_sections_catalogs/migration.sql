-- Add colorTheme column to products table
ALTER TABLE `products` ADD COLUMN `colorTheme` VARCHAR(191) NOT NULL DEFAULT 'blue';

-- Add index on order column for products
ALTER TABLE `products` ADD INDEX `products_order_idx`(`order`);

-- Create product_sections table
CREATE TABLE `product_sections` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `title_ar` VARCHAR(191),
    `content` LONGTEXT NOT NULL,
    `content_ar` LONGTEXT,
    `order` INT NOT NULL DEFAULT 0,
    `colorTheme` VARCHAR(191) NOT NULL DEFAULT 'blue',
    `productId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add indexes for product_sections
CREATE INDEX `product_sections_productId_idx` ON `product_sections`(`productId`);
CREATE INDEX `product_sections_order_idx` ON `product_sections`(`order`);

-- Add foreign key for product_sections
ALTER TABLE `product_sections` ADD CONSTRAINT `product_sections_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Create catalogs table
CREATE TABLE `catalogs` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `title_ar` VARCHAR(191),
    `description` TEXT,
    `description_ar` TEXT,
    `fileUrl` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL DEFAULT 'en',
    `order` INT NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add indexes for catalogs
CREATE INDEX `catalogs_category_idx` ON `catalogs`(`category`);
CREATE INDEX `catalogs_locale_idx` ON `catalogs`(`locale`);
CREATE INDEX `catalogs_isActive_idx` ON `catalogs`(`isActive`);
CREATE INDEX `catalogs_order_idx` ON `catalogs`(`order`);
