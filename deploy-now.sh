#!/bin/bash

# 🚀 TradeAutopsy Complete Deployment Script
# Starts from git add . through Vercel deployment

set -e  # Exit on error

echo "🚀 TradeAutopsy Complete Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Git Add
echo -e "${BLUE}📦 Step 1: Staging all changes...${NC}"
git add .
echo -e "${GREEN}✅ All changes staged${NC}"
echo ""

# Step 2: Git Commit
echo -e "${BLUE}💾 Step 2: Committing changes...${NC}"
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Deploy to Vercel - $(date +'%Y-%m-%d %H:%M:%S')"
fi
git commit -m "$commit_msg" || {
    echo -e "${YELLOW}⚠️  No changes to commit or commit failed${NC}"
}
echo -e "${GREEN}✅ Changes committed${NC}"
echo ""

# Step 3: Git Push
echo -e "${BLUE}📤 Step 3: Pushing to GitHub...${NC}"
read -p "Push to GitHub? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main || git push origin master || {
        echo -e "${YELLOW}⚠️  Push failed or no remote configured${NC}"
        read -p "Continue with deployment anyway? (y/n) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    }
    echo -e "${GREEN}✅ Pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping GitHub push${NC}"
fi
echo ""

# Step 4: Install Dependencies
echo -e "${BLUE}📦 Step 4: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 5: Build Check
echo -e "${BLUE}🔨 Step 5: Building project locally...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi
echo ""

# Step 6: Check Vercel CLI
echo -e "${BLUE}🔧 Step 6: Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm i -g vercel
else
    echo -e "${GREEN}✅ Vercel CLI found${NC}"
fi
echo ""

# Step 7: Vercel Login Check
echo -e "${BLUE}🔐 Step 7: Checking Vercel authentication...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel. Please login...${NC}"
    vercel login
else
    echo -e "${GREEN}✅ Logged in to Vercel${NC}"
fi
echo ""

# Step 8: Deploy to Vercel
echo -e "${BLUE}🚀 Step 8: Deploying to Vercel...${NC}"
read -p "Deploy to production? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying to production..."
    vercel --prod --yes
    echo -e "${GREEN}✅ Deployed to production${NC}"
else
    echo "Deploying preview..."
    vercel --yes
    echo -e "${GREEN}✅ Deployed preview${NC}"
fi
echo ""

# Step 9: Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. ✅ Check Vercel dashboard for deployment status"
echo "2. ✅ Verify environment variables are set in Vercel"
echo "3. ✅ Run database migrations in Supabase (if needed)"
echo "4. ✅ Update WorkOS redirect URI to production URL"
echo "5. ✅ Update Supabase redirect URLs"
echo "6. ✅ Test the application"
echo ""
echo "🌐 Your app should be live at your Vercel URL"
echo ""

