#!/bin/bash

echo "🚀 Setting up Fly.io deployment..."

# Check if fly CLI is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI not found. Please install it first:"
    echo "   curl -L https://fly.io/install.sh | sh"
    exit 1
fi

# Check if user is logged in
if ! fly auth whoami &> /dev/null; then
    echo "❌ Not logged in to Fly.io. Please run:"
    echo "   fly auth login"
    exit 1
fi

echo "✅ Fly CLI is ready"

# Create PostgreSQL database if it doesn't exist
echo "📦 Setting up PostgreSQL database..."
if ! fly postgres list | grep -q "ai-chat-db"; then
    echo "Creating PostgreSQL database..."
    fly postgres create --name ai-chat-db --region arn
else
    echo "PostgreSQL database already exists"
fi

# Attach database to app
echo "🔗 Attaching database to app..."
fly postgres attach --app backend-little-lake-3172 ai-chat-db

# Set environment variables
echo "🔧 Setting environment variables..."
fly secrets set OPENAI_API_KEY="your-openai-api-key-here"

# Deploy the app
echo "🚀 Deploying app..."
fly deploy

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://backend-little-lake-3172.fly.dev" 