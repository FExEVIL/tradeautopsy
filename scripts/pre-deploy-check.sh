#!/bin/bash

# Pre-Deployment Verification Script
# Run this before deploying to production

set -e

echo "🚀 TradeAutopsy Pre-Deployment Check"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
echo "📦 Checking Node.js version..."
if command_exists node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"
    else
        echo -e "${RED}❌ Node.js version $(node -v) is too old. Need 18+${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Node.js not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo ""
echo "📦 Checking npm..."
if command_exists npm; then
    echo -e "${GREEN}✅ npm version: $(npm -v)${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check if .env.local exists
echo ""
echo "🔐 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local file exists${NC}"
    
    # Check critical variables
    REQUIRED_VARS=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=" .env.local; then
            MISSING_VARS+=("$var")
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All required environment variables present${NC}"
    else
        echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
        for var in "${MISSING_VARS[@]}"; do
            echo -e "   ${YELLOW}- $var${NC}"
        done
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  .env.local file not found (this is OK if deploying to Vercel)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check if node_modules exists
echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules directory exists${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules not found. Run 'npm install' first${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check git status
echo ""
echo "📝 Checking git status..."
if command_exists git; then
    if [ -d ".git" ]; then
        if [ -n "$(git status --porcelain)" ]; then
            echo -e "${YELLOW}⚠️  You have uncommitted changes${NC}"
            echo "   Consider committing before deploying:"
            echo "   git add ."
            echo "   git commit -m 'Your message'"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "${GREEN}✅ Git working directory clean${NC}"
        fi
        
        # Check if on main/master branch
        CURRENT_BRANCH=$(git branch --show-current)
        if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
            echo -e "${GREEN}✅ On $CURRENT_BRANCH branch${NC}"
        else
            echo -e "${YELLOW}⚠️  Currently on '$CURRENT_BRANCH' branch (not main/master)${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  Not a git repository${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Git not found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Run production build test
echo ""
echo "🔨 Testing production build..."
if command_exists npm; then
    if npm run build > /tmp/build.log 2>&1; then
        echo -e "${GREEN}✅ Production build successful${NC}"
        
        # Check for common build issues
        if grep -q "error" /tmp/build.log; then
            echo -e "${YELLOW}⚠️  Build completed but contains errors (check /tmp/build.log)${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${RED}❌ Production build failed${NC}"
        echo "   Check /tmp/build.log for details"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${YELLOW}⚠️  Cannot test build (npm not found)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for common issues
echo ""
echo "🔍 Checking for common issues..."

# Check if .next directory exists (from build)
if [ -d ".next" ]; then
    echo -e "${GREEN}✅ .next directory exists (build completed)${NC}"
else
    echo -e "${YELLOW}⚠️  .next directory not found (run 'npm run build' first)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for sensitive files that shouldn't be committed
SENSITIVE_FILES=(".env.local" ".env" ".env.production")
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ] && git check-ignore -q "$file" 2>/dev/null; then
        echo -e "${GREEN}✅ $file is in .gitignore${NC}"
    elif [ -f "$file" ]; then
        echo -e "${YELLOW}⚠️  $file exists but may not be in .gitignore${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# Summary
echo ""
echo "======================================"
echo "📊 Summary"
echo "======================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found. Review above.${NC}"
    echo -e "${GREEN}✅ No critical errors. Can proceed with deployment.${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found. Fix before deploying.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) also found.${NC}"
    fi
    exit 1
fi

