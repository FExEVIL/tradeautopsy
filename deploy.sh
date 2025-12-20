#!/bin/bash

# 🚀 TradeAutopsy Deployment Script
# Quick deployment to Vercel

set -e  # Exit on error

echo "🚀 TradeAutopsy Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Step 1: Check if Vercel CLI is installed
echo "📦 Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm i -g vercel
else
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
fi

# Step 2: Check if logged in
echo ""
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in. Please login...${NC}"
    vercel login
else
    echo -e "${GREEN}✅ Logged in to Vercel${NC}"
fi

# Step 3: Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Step 4: Run linting (optional)
echo ""
read -p "🔍 Run linting before deploy? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running linter..."
    npm run lint || echo -e "${YELLOW}⚠️  Linting found issues, but continuing...${NC}"
fi

# Step 5: Build locally to catch errors
echo ""
echo "🔨 Building project locally..."
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

# Step 6: Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
read -p "Deploy to production? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying to production..."
    vercel --prod --yes
else
    echo "Deploying preview..."
    vercel --yes
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Check Vercel dashboard for deployment status"
echo "2. Verify environment variables are set"
echo "3. Test the application"
echo "4. Run database migrations if needed"
echo ""

