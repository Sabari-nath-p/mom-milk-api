-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `zipcode` VARCHAR(191) NOT NULL,
    `userType` ENUM('DONOR', 'BUYER', 'ADMIN') NOT NULL,
    `isNew` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `fcmToken` VARCHAR(191) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `description` VARCHAR(191) NULL,
    `bloodGroup` VARCHAR(191) NULL,
    `babyDeliveryDate` DATETIME(3) NULL,
    `healthStyle` VARCHAR(191) NULL,
    `ableToShareMedicalRecord` BOOLEAN NULL DEFAULT false,
    `isAvailable` BOOLEAN NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `babies` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `gender` ENUM('BOY', 'GIRL', 'OTHER') NOT NULL,
    `deliveryDate` DATETIME(3) NOT NULL,
    `bloodGroup` VARCHAR(191) NULL,
    `weight` DOUBLE NULL,
    `height` DOUBLE NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feed_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `feedingDate` DATETIME(3) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `feedType` ENUM('BREAST', 'BOTTLE', 'OTHER') NOT NULL,
    `position` ENUM('LEFT', 'RIGHT', 'BOTH') NULL,
    `amount` DOUBLE NULL,
    `note` VARCHAR(191) NULL,
    `babyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diaper_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `time` DATETIME(3) NOT NULL,
    `diaperType` ENUM('SOLID', 'LIQUID', 'BOTH', 'EMPTY') NOT NULL,
    `note` VARCHAR(191) NULL,
    `babyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sleep_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NULL,
    `sleepQuality` VARCHAR(191) NULL,
    `location` ENUM('CRIB', 'BED', 'STROLLER', 'OTHER') NOT NULL,
    `note` VARCHAR(191) NULL,
    `babyId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_verifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `userId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `zip_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `country` VARCHAR(191) NOT NULL,
    `zipcode` VARCHAR(191) NOT NULL,
    `placeName` VARCHAR(191) NOT NULL,
    `latitude` DOUBLE NOT NULL,
    `longitude` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `zip_codes_zipcode_key`(`zipcode`),
    INDEX `zip_codes_country_zipcode_idx`(`country`, `zipcode`),
    INDEX `zip_codes_latitude_longitude_idx`(`latitude`, `longitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milk_requests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requestType` ENUM('MILK_REQUEST', 'MILK_OFFER') NOT NULL DEFAULT 'MILK_REQUEST',
    `status` ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `quantity` DOUBLE NULL,
    `urgency` VARCHAR(191) NULL,
    `requesterId` INTEGER NOT NULL,
    `donorId` INTEGER NULL,
    `requesterZipcode` VARCHAR(191) NOT NULL,
    `donorZipcode` VARCHAR(191) NULL,
    `distance` DOUBLE NULL,
    `neededBy` DATETIME(3) NULL,
    `acceptedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `milk_requests_status_requestType_idx`(`status`, `requestType`),
    INDEX `milk_requests_requesterId_idx`(`requesterId`),
    INDEX `milk_requests_donorId_idx`(`donorId`),
    INDEX `milk_requests_requesterZipcode_idx`(`requesterZipcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request_notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `requestId` INTEGER NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `request_notifications_userId_isRead_idx`(`userId`, `isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `babies` ADD CONSTRAINT `babies_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feed_logs` ADD CONSTRAINT `feed_logs_babyId_fkey` FOREIGN KEY (`babyId`) REFERENCES `babies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `diaper_logs` ADD CONSTRAINT `diaper_logs_babyId_fkey` FOREIGN KEY (`babyId`) REFERENCES `babies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sleep_logs` ADD CONSTRAINT `sleep_logs_babyId_fkey` FOREIGN KEY (`babyId`) REFERENCES `babies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `otp_verifications` ADD CONSTRAINT `otp_verifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_requests` ADD CONSTRAINT `milk_requests_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milk_requests` ADD CONSTRAINT `milk_requests_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_notifications` ADD CONSTRAINT `request_notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `request_notifications` ADD CONSTRAINT `request_notifications_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `milk_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
