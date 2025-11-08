-- Add social media links to User table
-- Migration: add_social_links
-- Date: 2025-11-09

ALTER TABLE `User` ADD COLUMN `facebookLink` VARCHAR(191) NULL;
ALTER TABLE `User` ADD COLUMN `instagramLink` VARCHAR(191) NULL;
