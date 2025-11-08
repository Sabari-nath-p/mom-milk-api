#!/bin/bash
# Deploy social links migration to hosted server

echo "🚀 Deploying Social Links Migration"
echo "===================================="

# Step 1: Apply SQL migration to database
echo ""
echo "📝 Step 1: Applying SQL migration..."
mysql -u palqardev -p"Parasya@2025" -h localhost moms_milk_db < add_social_links.sql

if [ $? -eq 0 ]; then
    echo "✅ SQL migration applied successfully"
else
    echo "❌ Failed to apply SQL migration"
    exit 1
fi

# Step 2: Generate Prisma Client with new types
echo ""
echo "🔄 Step 2: Generating Prisma Client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma Client generated successfully"
else
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

# Step 3: Build the application
echo ""
echo "🔨 Step 3: Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Application built successfully"
else
    echo "❌ Failed to build application"
    exit 1
fi

# Step 4: Restart the application
echo ""
echo "🔄 Step 4: Restarting application..."
pm2 restart mom-milk-api || npm run start:prod &

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Summary of changes:"
echo "  - Added facebookLink field to User table"
echo "  - Added instagramLink field to User table"
echo "  - Updated Prisma Client types"
echo "  - Rebuilt and restarted application"
echo ""
echo "🧪 Next steps:"
echo "  1. Test profile update with social links"
echo "  2. Test email notifications include social links"
echo "  3. Test availability toggle notifications"
echo "  4. Test babies endpoint requires authentication"
