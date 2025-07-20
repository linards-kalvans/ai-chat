#!/bin/bash

echo "🔧 Initializing uv environment..."

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

# Remove any existing lock file to ensure clean generation
if [ -f uv.lock ]; then
    echo "🧹 Removing existing lock file..."
    rm uv.lock
fi

# Ensure pyproject.toml exists
if [ ! -f pyproject.toml ]; then
    echo "❌ pyproject.toml not found. Please ensure you're in the backend directory."
    exit 1
fi

# Sync dependencies to generate proper lock file
echo "📦 Installing dependencies and generating lock file..."
uv sync

# Verify the lock file was generated
if [ ! -f uv.lock ]; then
    echo "❌ Failed to generate uv.lock file."
    exit 1
fi

echo "✅ Lock file generated successfully."

# Verify the installation
echo "🧪 Testing installation..."
if uv run python -c "import fastapi, uvicorn, sqlalchemy, openai; print('✅ All dependencies installed successfully!')"; then
    echo ""
    echo "🎉 uv environment initialized successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "   uv run uvicorn app.main:app --reload  # Start the server"
    echo "   uv add package-name                   # Add new dependencies"
    echo "   uv add --dev package-name             # Add dev dependencies"
    echo "   uv sync                               # Update dependencies"
    echo ""
    echo "📚 Learn more: https://docs.astral.sh/uv/"
else
    echo "❌ Initialization failed. Please check the error messages above."
    exit 1
fi 