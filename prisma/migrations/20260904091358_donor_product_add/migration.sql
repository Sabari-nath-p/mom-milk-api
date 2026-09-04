-- AlterTable
ALTER TABLE `marketplace_listings` ADD COLUMN `isDonation` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `quantity` DOUBLE NULL,
    MODIFY `category` ENUM('CRADLES', 'TOYS', 'CLOTHING', 'STROLLERS', 'CAR_SEATS', 'FEEDING', 'BATH', 'SAFETY', 'BOOKS', 'EDUCATIONAL', 'MILK', 'OTHER') NOT NULL,
    MODIFY `materials` VARCHAR(191) NULL,
    MODIFY `colors` VARCHAR(191) NULL,
    MODIFY `boxContains` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `availableForDonation` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `profilePhoto` VARCHAR(191) NULL;
