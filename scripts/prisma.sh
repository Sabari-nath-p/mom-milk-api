#!/bin/bash

# Prisma operations script for Docker environment
# Usage: ./scripts/prisma.sh [command]

set -e

CONTAINER_NAME="moms_milk_api_dev"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Help function
show_help() {
    cat << EOF
🗄️  Prisma Operations for Mom's Milk API

Usage: ./scripts/prisma.sh [COMMAND]

Available Commands:
  generate         Generate Prisma client
  migrate          Run database migrations (dev)
  migrate-deploy   Deploy migrations (production)
  migrate-reset    Reset database and run all migrations
  push             Push schema to database (no migrations)
  studio           Start Prisma Studio (database UI)
  validate         Validate Prisma schema
  status           Show migration status
  seed             Run database seeder
  reset-dev        Complete database reset for development
  backup           Create database backup
  restore          Restore database from backup

Examples:
  ./scripts/prisma.sh migrate       # Run migrations
  ./scripts/prisma.sh studio        # Open database UI
  ./scripts/prisma.sh reset-dev     # Fresh database setup

Requirements:
  - Docker and docker-compose installed
  - API container running (moms_milk_api_dev)

EOF
}

# Check if container is running
check_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}❌ Container $CONTAINER_NAME is not running${NC}"
        echo -e "${YELLOW}💡 Start it with: docker-compose up -d${NC}"
        exit 1
    fi
}

# Execute Prisma command in container
run_prisma() {
    local cmd="$1"
    echo -e "${BLUE}🔄 Running: npx prisma $cmd${NC}"
    docker-compose exec api npx prisma $cmd
}

# Execute npm script in container
run_npm() {
    local script="$1"
    echo -e "${BLUE}🔄 Running: npm run $script${NC}"
    docker-compose exec api npm run $script
}

# Main command handler
case "${1:-help}" in
    "generate"|"gen")
        echo -e "${GREEN}📦 Generating Prisma client...${NC}"
        check_container
        run_prisma "generate"
        echo -e "${GREEN}✅ Prisma client generated successfully${NC}"
        ;;
        
    "migrate"|"mig")
        echo -e "${GREEN}🚀 Running database migrations...${NC}"
        check_container
        run_prisma "migrate dev"
        echo -e "${GREEN}✅ Migrations completed${NC}"
        ;;
        
    "migrate-deploy"|"deploy")
        echo -e "${GREEN}🚀 Deploying migrations to production...${NC}"
        check_container
        run_prisma "migrate deploy"
        echo -e "${GREEN}✅ Production migrations deployed${NC}"
        ;;
        
    "migrate-reset"|"reset-mig")
        echo -e "${YELLOW}⚠️  This will reset your database and lose all data!${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            check_container
            run_prisma "migrate reset --force"
            echo -e "${GREEN}✅ Database reset completed${NC}"
        else
            echo -e "${BLUE}ℹ️  Operation cancelled${NC}"
        fi
        ;;
        
    "push")
        echo -e "${GREEN}📤 Pushing schema to database...${NC}"
        check_container
        run_prisma "db push"
        echo -e "${GREEN}✅ Schema pushed successfully${NC}"
        ;;
        
    "studio")
        echo -e "${GREEN}🎨 Starting Prisma Studio...${NC}"
        echo -e "${BLUE}📱 Access at: http://localhost:5555${NC}"
        check_container
        run_prisma "studio --hostname 0.0.0.0 --port 5555"
        ;;
        
    "validate")
        echo -e "${GREEN}✅ Validating Prisma schema...${NC}"
        check_container
        run_prisma "validate"
        echo -e "${GREEN}✅ Schema is valid${NC}"
        ;;
        
    "status")
        echo -e "${GREEN}📊 Checking migration status...${NC}"
        check_container
        run_prisma "migrate status"
        ;;
        
    "seed")
        echo -e "${GREEN}🌱 Running database seeder...${NC}"
        check_container
        run_npm "prisma:seed"
        echo -e "${GREEN}✅ Database seeded successfully${NC}"
        ;;
        
    "reset-dev")
        echo -e "${YELLOW}🔄 Complete development database reset...${NC}"
        echo -e "${YELLOW}⚠️  This will:"
        echo -e "   - Reset all migrations"
        echo -e "   - Regenerate Prisma client"
        echo -e "   - Run database seeder"
        echo -e "   - Import zipcode data${NC}"
        read -p "Continue? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            check_container
            run_prisma "migrate reset --force"
            run_prisma "generate"
            run_npm "prisma:seed"
            echo -e "${GREEN}✅ Development database ready!${NC}"
        else
            echo -e "${BLUE}ℹ️  Operation cancelled${NC}"
        fi
        ;;
        
    "backup")
        echo -e "${GREEN}💾 Creating database backup...${NC}"
        BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
        docker-compose exec mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD:-password123} moms_milk > "$BACKUP_FILE"
        echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
        ;;
        
    "restore")
        if [ -z "$2" ]; then
            echo -e "${RED}❌ Please provide backup file: ./scripts/prisma.sh restore backup.sql${NC}"
            exit 1
        fi
        echo -e "${GREEN}📥 Restoring database from $2...${NC}"
        docker-compose exec -T mysql mysql -u root -p${MYSQL_ROOT_PASSWORD:-password123} moms_milk < "$2"
        echo -e "${GREEN}✅ Database restored from $2${NC}"
        ;;
        
    "help"|"-h"|"--help")
        show_help
        ;;
        
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo -e "${YELLOW}💡 Run './scripts/prisma.sh help' for available commands${NC}"
        exit 1
        ;;
esac
