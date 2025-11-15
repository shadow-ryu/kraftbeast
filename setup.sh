#!/bin/bash

# KraftBeast Setup Script
# This script helps you set up KraftBeast locally

set -e

echo "🦁 KraftBeast Setup Script"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm $(npm -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ .env.local created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env.local with your actual credentials:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    echo "   - CLERK_SECRET_KEY"
    echo "   - GITHUB_WEBHOOK_SECRET"
    echo ""
    read -p "Press Enter after you've updated .env.local..."
else
    echo "✅ .env.local already exists"
fi

echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

# Ask if user wants to run migrations
read -p "Do you want to run database migrations now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Running database migrations..."
    npx prisma migrate dev --name init
    echo "✅ Migrations completed"
else
    echo "⚠️  Skipping migrations. Run 'npm run db:migrate' later."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your .env.local has all required credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Sign up with GitHub and start syncing repos!"
echo ""
echo "📚 Documentation:"
echo "   - QUICKSTART.md - Quick start guide"
echo "   - DEPLOYMENT.md - Deployment instructions"
echo "   - TESTING.md - Testing guide"
echo "   - ROADMAP.md - Feature roadmap"
echo ""
echo "Happy coding! 🚀"
