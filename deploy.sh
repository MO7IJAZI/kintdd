#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment for KINT Website..."

# Load environment variables if .env exists
if [ -f .env ]; then
  echo "📄 Loading environment variables..."
  export $(cat .env | grep -v '#' | xargs)
fi

# 1. Install Dependencies
echo "📦 Installing dependencies..."
# Use npm ci for a clean, deterministic install based on package-lock.json
npm ci --production=false # We need devDependencies for build (typescript, types)

# 2. Build the Application
echo "🏗️ Building application..."
# This runs: fix-permissions -> prisma generate -> migrate -> seed -> next build -> post-build
npm run build

# 3. Prune devDependencies to save space (Optional but recommended for 'light' deployment)
echo "🧹 Pruning dev dependencies..."
npm prune --production

# 4. Process Management (Optional on Hostinger Cloud)
# On Hostinger Cloud Startup (hPanel), the "Node.js App" manager handles the process.
# We try to use PM2 if available, but we don't fail if it's not.
echo "🔄 Managing process..."

if command -v pm2 &> /dev/null; then
    echo "PM2 detected. Attempting to reload..."
    # Start or Reload
    if pm2 list | grep -q "kint-website"; then
        echo "Reloading existing application..."
        pm2 reload ecosystem.config.js --update-env || true
    else
        echo "Starting new application instance..."
        pm2 start ecosystem.config.js || true
    fi
    pm2 save || true
else
    echo "PM2 not found. Assuming hPanel Node.js Manager is handling the process."
    echo "PLEASE REMEMBER TO CLICK 'RESTART' IN YOUR HOSTINGER CONTROL PANEL."
fi

echo "✅ Deployment build successful!"
