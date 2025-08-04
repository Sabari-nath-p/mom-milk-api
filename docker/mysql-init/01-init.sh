#!/bin/bash
# MySQL initialization script
# This script runs when the MySQL container starts for the first time

echo "Starting MySQL initialization..."

# Create additional databases if needed
mysql -u root -p$MYSQL_ROOT_PASSWORD <<-EOSQL
    CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE}_test;
    GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}_test.* TO '${MYSQL_USER}'@'%';
    FLUSH PRIVILEGES;
EOSQL

echo "MySQL initialization completed."
