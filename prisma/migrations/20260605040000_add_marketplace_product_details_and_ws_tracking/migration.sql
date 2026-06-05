-- Add lastWsConnectedAt to users table for WebSocket connection tracking
ALTER TABLE `users` ADD COLUMN `lastWsConnectedAt` DATETIME(3) NULL;

-- Add optional product detail fields to marketplace_listings
ALTER TABLE `marketplace_listings`
  ADD COLUMN `originPrice` DOUBLE NULL,
  ADD COLUMN `purchasedOn` DATETIME(3) NULL,
  ADD COLUMN `brand` VARCHAR(191) NULL,
  ADD COLUMN `materials` LONGTEXT NULL,
  ADD COLUMN `colors` LONGTEXT NULL,
  ADD COLUMN `dimensions` VARCHAR(191) NULL,
  ADD COLUMN `boxContains` LONGTEXT NULL;
