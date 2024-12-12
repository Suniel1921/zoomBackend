#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "Starting deployment process..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}PM2 is not installed. Installing...${NC}"
    npm install -g pm2
fi

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Run database setup
echo "Setting up database..."
node scripts/setup-db.js

# Build the application
echo "Building the application..."
npm run build

# Start/Restart PM2 process
echo "Starting PM2 process..."
pm2 startOrRestart pm2.config.js

echo -e "${GREEN}Deployment completed successfully!${NC}"