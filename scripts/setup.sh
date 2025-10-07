#!/bin/bash

# PubHub Setup Script
# This script helps you set up the backend infrastructure for PubHub

set -e

echo "🚀 PubHub Backend Setup Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local file not found${NC}"
    echo "Please create .env.local based on .env.example"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found .env.local"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Supabase CLI not found"
    echo "Installing Supabase CLI..."

    if command -v npm &> /dev/null; then
        npm install -g supabase
    else
        echo -e "${RED}❌ npm not found. Please install Node.js and npm first${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Supabase CLI is installed"
echo ""

# Ask user if they want to link to existing project or create new one
echo "Do you want to:"
echo "1) Link to an existing Supabase project (recommended)"
echo "2) Create a new Supabase project"
echo "3) Skip Supabase setup (manual setup later)"
echo ""
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "To link to your existing Supabase project:"
        echo "1. Go to https://app.supabase.com"
        echo "2. Select your project"
        echo "3. Go to Project Settings > API"
        echo "4. Copy your Project Reference ID"
        echo ""
        read -p "Enter your Supabase Project Reference ID: " project_ref

        echo ""
        echo "Linking to project..."
        supabase link --project-ref "$project_ref"

        echo ""
        echo -e "${GREEN}✓${NC} Linked to Supabase project"
        echo ""

        # Apply migrations
        echo "Applying database schema..."
        supabase db push

        echo ""
        echo -e "${GREEN}✓${NC} Database schema applied"
        ;;
    2)
        echo ""
        echo "Creating new Supabase project..."
        echo "Please follow the prompts from Supabase CLI"
        echo ""
        supabase init
        supabase start

        echo ""
        echo -e "${YELLOW}⚠${NC} Please update your .env.local with the credentials shown above"
        ;;
    3)
        echo ""
        echo -e "${YELLOW}⚠${NC} Skipping Supabase setup"
        echo "You'll need to manually set up your Supabase project later"
        echo "See SETUP_GUIDE.md for instructions"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials (if not done)"
echo "2. Update .env.local with platform API keys (optional, for integrations)"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Visit http://localhost:5173 to see your app"
echo ""
echo "For more information, see SETUP_GUIDE.md"
