-- Ensure existing rows have an Arabic name before making the column NOT NULL
UPDATE `categories`
SET `name_ar` = `name`
WHERE `name_ar` IS NULL OR `name_ar` = '';

-- AlterTable
ALTER TABLE `categories` MODIFY `name_ar` VARCHAR(191) NOT NULL;
