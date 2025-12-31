#!/bin/bash

# Setup Firebase Credentials for Production
# Run this on your production server: bash setup-firebase-production.sh

echo "🔥 Firebase Credentials Setup"
echo "=============================="
echo ""

# Check if firebase-service-account.json exists
if [ -f "firebase-service-account.json" ]; then
    echo "✅ Found firebase-service-account.json"
    echo ""
    echo "📝 Extracting credentials to environment variables..."
    
    # Extract values from JSON
    PROJECT_ID=$(cat firebase-service-account.json | grep -o '"project_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"project_id"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    PRIVATE_KEY=$(cat firebase-service-account.json | grep -o '"private_key"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"private_key"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    CLIENT_EMAIL=$(cat firebase-service-account.json | grep -o '"client_email"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"client_email"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    PRIVATE_KEY_ID=$(cat firebase-service-account.json | grep -o '"private_key_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"private_key_id"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    CLIENT_ID=$(cat firebase-service-account.json | grep -o '"client_id"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"client_id"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    CERT_URL=$(cat firebase-service-account.json | grep -o '"client_x509_cert_url"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"client_x509_cert_url"[[:space:]]*:[[:space:]]*"\([^"]*\)"/\1/')
    
    echo "Project ID: $PROJECT_ID"
    echo "Client Email: $CLIENT_EMAIL"
    echo ""
    
    # Backup existing .env if it exists
    if [ -f ".env" ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo "📦 Backed up existing .env file"
    fi
    
    # Remove old Firebase variables if they exist
    sed -i '/^FIREBASE_/d' .env 2>/dev/null || true
    
    # Append Firebase credentials to .env
    echo "" >> .env
    echo "# Firebase Admin SDK Configuration" >> .env
    echo "FIREBASE_PROJECT_ID=\"$PROJECT_ID\"" >> .env
    echo "FIREBASE_PRIVATE_KEY=\"$PRIVATE_KEY\"" >> .env
    echo "FIREBASE_CLIENT_EMAIL=\"$CLIENT_EMAIL\"" >> .env
    echo "FIREBASE_PRIVATE_KEY_ID=\"$PRIVATE_KEY_ID\"" >> .env
    echo "FIREBASE_CLIENT_ID=\"$CLIENT_ID\"" >> .env
    echo "FIREBASE_CLIENT_X509_CERT_URL=\"$CERT_URL\"" >> .env
    
    echo "✅ Firebase credentials added to .env"
    echo ""
    
else
    echo "❌ firebase-service-account.json not found!"
    echo ""
    echo "Please do the following:"
    echo "1. Go to Firebase Console: https://console.firebase.google.com/"
    echo "2. Select your project"
    echo "3. Go to Project Settings → Service Accounts"
    echo "4. Click 'Generate new private key'"
    echo "5. Download the JSON file"
    echo "6. Upload it to this directory as 'firebase-service-account.json'"
    echo "7. Run this script again"
    echo ""
    exit 1
fi

# Ask if user wants to restart the app
echo ""
read -p "Do you want to restart the application now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Restarting application..."
    pm2 restart Momsmilk
    echo ""
    echo "✅ Application restarted!"
    echo ""
    echo "📊 Checking logs..."
    sleep 2
    pm2 logs Momsmilk --lines 20
else
    echo ""
    echo "⚠️  Remember to restart your application:"
    echo "   pm2 restart Momsmilk"
    echo ""
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Test notifications with: POST /notifications/send-custom"
echo "2. Monitor logs: pm2 logs Momsmilk"
echo "3. Check Firebase Console for APNs configuration (for iOS)"
