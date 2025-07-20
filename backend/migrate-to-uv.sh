#!/bin/bash

echo "🔄 Migrating from pip to uv..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed. Installing uv..."
    
    # Try different installation methods
    if command -v curl &> /dev/null; then
        echo "📦 Installing uv with curl..."
        curl -LsSf https://astral.sh/uv/install.sh | sh
        source ~/.bashrc 2>/dev/null || source ~/.zshrc 2>/dev/null || true
    elif command -v pip &> /dev/null; then
        echo "📦 Installing uv with pip..."
        pip install uv
    else
        echo "❌ Could not install uv. Please install it manually:"
        echo "   Visit: https://docs.astral.sh/uv/getting-started/installation/"
        exit 1
    fi
fi

# Verify uv installation
if ! command -v uv &> /dev/null; then
    echo "❌ uv installation failed. Please install it manually."
    exit 1
fi

echo "✅ uv is installed: $(uv --version)"

# Create pyproject.toml if it doesn't exist
if [ ! -f pyproject.toml ]; then
    echo "📝 Creating pyproject.toml..."
    cat > pyproject.toml << 'EOF'
[project]
name = "ai-chat-backend"
version = "1.0.0"
description = "AI Chat Application Backend - FastAPI server for xAI and OpenAI integration"
authors = [
    {name = "AI Chat Team", email = "team@aichat.local"}
]
requires-python = ">=3.11"
dependencies = [
    "fastapi==0.104.1",
    "uvicorn[standard]==0.24.0",
    "sqlalchemy==2.0.23",
    "alembic==1.12.1",
    "pydantic==2.5.0",
    "pydantic-settings==2.1.0",
    "python-multipart==0.0.6",
    "httpx==0.25.2",
    "openai==1.3.7",
    "python-dotenv==1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest==7.4.3",
    "pytest-asyncio==0.21.1",
    "black==23.11.0",
    "isort==5.12.0",
    "flake8==6.1.0",
    "mypy==1.7.1",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["app"]
EOF
fi

# Remove any existing lock file
if [ -f uv.lock ]; then
    echo "🧹 Removing existing lock file..."
    rm uv.lock
fi

# Sync dependencies with uv
echo "📦 Installing dependencies with uv..."
uv sync

# Test the installation
echo "🧪 Testing installation..."
if uv run python -c "import fastapi, uvicorn, sqlalchemy, openai; print('✅ All dependencies installed successfully!')"; then
    echo ""
    echo "🎉 Migration to uv completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   uv run uvicorn app.main:app --reload  # Start the server"
    echo "   uv add package-name                   # Add new dependencies"
    echo "   uv add --dev package-name             # Add dev dependencies"
    echo "   uv sync                               # Update dependencies"
    echo ""
    echo "📚 Learn more: https://docs.astral.sh/uv/"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi 