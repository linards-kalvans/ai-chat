#!/bin/bash

echo "🚀 Starting AI Chat Application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your API keys before starting the application"
    echo "   - OPENAI_API_KEY: Get from https://platform.openai.com/api-keys"
    echo "   - XAI_API_KEY: Get from xAI platform"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create data directory
mkdir -p data

echo "🐳 Building and starting containers..."
echo "📦 Using uv for Python dependency management..."
docker-compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if curl -f http://localhost:8000/health &> /dev/null; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "❌ Backend failed to start"
    docker-compose logs backend
    exit 1
fi

if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend failed to start"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "🎉 AI Chat Application is ready!"
echo "📱 Open http://localhost:3000 in your browser"
echo ""
echo "📋 Useful commands:"
echo "   docker-compose logs -f    # View logs"
echo "   docker-compose down       # Stop services"
echo "   docker-compose restart    # Restart services"
echo ""
echo "🔧 Local Development:"
echo "   cd backend && uv sync     # Install Python dependencies with uv"
echo "   cd frontend && npm install # Install Node.js dependencies"
echo "   uv run uvicorn app.main:app --reload  # Run backend locally"
echo "   npm start                 # Run frontend locally" 