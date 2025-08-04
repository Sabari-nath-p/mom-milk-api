-- MySQL initialization script for Mom's Milk API
-- This script runs when the MySQL container starts for the first time

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS moms_milk;

-- Use the database
USE moms_milk;

-- Create application user with proper permissions
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'app_password';
GRANT ALL PRIVILEGES ON moms_milk.* TO 'app_user'@'%';

-- Set proper timezone
SET GLOBAL time_zone = '+00:00';

-- Enable binary logging for replication (optional)
-- SET GLOBAL log_bin = ON;

-- Set proper character set and collation
ALTER DATABASE moms_milk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optimize MySQL settings for application
SET GLOBAL innodb_buffer_pool_size = 128M;
SET GLOBAL max_connections = 200;
SET GLOBAL query_cache_size = 32M;
SET GLOBAL query_cache_type = 1;

-- Flush privileges to ensure changes take effect
FLUSH PRIVILEGES;

-- Log initialization completion
SELECT 'Mom\'s Milk Database initialized successfully!' as Status;
