-- AlterTable
ALTER TABLE `ecom_orders`
    ADD COLUMN `trackingNumber` VARCHAR(191) NULL,
    ADD COLUMN `carrier` VARCHAR(191) NULL,
    ADD COLUMN `trackingUrl` VARCHAR(500) NULL,
    ADD COLUMN `estimatedDelivery` DATETIME(3) NULL,
    ADD COLUMN `shippedAt` DATETIME(3) NULL,
    ADD COLUMN `deliveredAt` DATETIME(3) NULL,
    ADD COLUMN `trackingNotes` TEXT NULL;
