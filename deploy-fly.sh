#!/bin/bash

# Fly.io Deployment Script
set -e

echo "🚀 Starting Fly.io deployment..."

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Installing..."
    curl -L https://fly.io/install.sh | sh
    export PATH="$HOME/.fly/bin:$PATH"
fi

# Check if user is authenticated
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not authenticated with Fly.io. Please run: fly auth login"
    exit 1
fi

# Navigate to backend directory
cd backend

# Check if fly.toml exists
if [ ! -f "fly.toml" ]; then
    echo "❌ fly.toml not found. Running fly launch..."
    fly launch --no-deploy
fi

# Set environment variables
echo "🔧 Setting environment variables..."

# Check if secrets are already set
if ! fly secrets list | grep -q "OPENAI_API_KEY"; then
    echo "⚠️  OPENAI_API_KEY not set. Please set it with:"
    echo "   fly secrets set OPENAI_API_KEY=your_key"
fi

if ! fly secrets list | grep -q "XAI_API_KEY"; then
    echo "⚠️  XAI_API_KEY not set. Please set it with:"
    echo "   fly secrets set XAI_API_KEY=your_key"
fi

# Set database URL if not set
if ! fly secrets list | grep -q "DATABASE_URL"; then
    echo "⚠️  DATABASE_URL not set. Please set it with:"
    echo "   fly secrets set DATABASE_URL=your_database_url"
fi

# Deploy the application
echo "🚀 Deploying to Fly.io..."
fly deploy

# Check deployment status
echo "✅ Deployment completed!"
echo "🌐 Your app is available at: https://$(fly info | grep 'Hostname' | awk '{print $2}')"

# Show logs
echo "📋 Recent logs:"
fly logs