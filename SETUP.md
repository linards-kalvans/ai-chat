# Quick Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- API keys for OpenAI and/or xAI
- **uv** Python package manager (recommended) or pip

## Quick Start (5 minutes)

### 1. Clone and Setup
```bash
# Navigate to project directory
cd ai-chat-app

# Make startup script executable
chmod +x start.sh
```

### 2. Configure API Keys
```bash
# Copy environment template
cp env.example .env

# Edit .env file with your API keys
nano .env
```

Add your API keys:
```env
OPENAI_API_KEY=sk-your-openai-key-here
XAI_API_KEY=your-xai-key-here
```

### 3. Start the Application
```bash
# Run the startup script
./start.sh
```

### 4. Access the Application
Open your browser and go to: **http://localhost:3000**

## Manual Setup

### Option 1: Docker Compose (Recommended)
```bash
# Build and start services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Local Development

#### Backend Setup with uv (Recommended)

**Install uv:**
```bash
# On macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or with pip
pip install uv
```

**Initialize uv environment:**
```bash
cd backend
./init-uv.sh
```

**Setup backend:**
```bash
cd backend

# Install dependencies with uv
uv sync

# Set environment variables
export OPENAI_API_KEY="your-key"
export XAI_API_KEY="your-key"

# Start backend with uv
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Backend Setup with pip (Alternative)
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export OPENAI_API_KEY="your-key"
export XAI_API_KEY="your-key"

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

## API Key Setup

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env` file: `OPENAI_API_KEY=sk-...`

### xAI API Key
1. Sign up for xAI access
2. Get your API key from the xAI platform
3. Add to `.env` file: `XAI_API_KEY=...`

## Features

✅ **Multi-Model Support**: Chat with OpenAI and xAI models  
✅ **Local Storage**: SQLite database for persistent history  
✅ **Modern UI**: React-based chat interface  
✅ **Docker Support**: Easy containerized deployment  
✅ **Responsive Design**: Works on desktop and mobile  
✅ **Real-time Chat**: Instant message sending and receiving  
✅ **Chat Management**: Create, view, and delete conversations  
✅ **uv Integration**: Fast Python dependency management  

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :8000

# Kill processes or change ports in docker-compose.yml
```

**API key errors**
```bash
# Check if .env file exists and has correct format
cat .env

# Restart containers after changing .env
docker-compose restart
```

**Database issues**
```bash
# Remove and recreate database
rm -rf data/
docker-compose up --build
```

**Frontend not loading**
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check frontend logs
docker-compose logs frontend
```

**uv.lock parsing errors**
```bash
# Clean up and reinitialize uv environment
cd backend
rm -f uv.lock
./init-uv.sh
```

**uv installation issues**
```bash
# Alternative installation methods
pip install uv

# Or use pip directly
pip install -r backend/requirements.txt
```

**Docker build failures with uv**
```bash
# Clean Docker cache and rebuild
docker-compose down
docker system prune -f
docker-compose up --build
```

### Getting Help

1. Check the logs: `docker-compose logs -f`
2. Verify API keys are correct
3. Ensure ports 3000 and 8000 are available
4. Check Docker is running and has sufficient resources
5. Run `./backend/init-uv.sh` to fix uv-related issues

## Development

### Project Structure
```
ai-chat-app/
├── backend/          # FastAPI server
│   ├── pyproject.toml  # uv dependency specification
│   ├── uv.lock        # Locked dependency versions
│   ├── requirements.txt # Compatibility file
│   ├── init-uv.sh     # uv initialization script
│   └── migrate-to-uv.sh # Migration script
├── frontend/         # React application
├── docker-compose.yml
├── start.sh         # Quick start script
└── README.md        # Detailed documentation
```

### Making Changes

**Backend Changes**
```bash
cd backend
# Edit Python files
docker-compose restart backend
```

**Frontend Changes**
```bash
cd frontend
# Edit React files
docker-compose restart frontend
```

**Dependency Management with uv**
```bash
cd backend

# Add new dependency
uv add package-name

# Add development dependency
uv add --dev package-name

# Update dependencies
uv sync

# Run with uv
uv run python script.py
```

### Adding New AI Providers

1. Add provider to `backend/app/services/ai_service.py`
2. Update frontend model selector in `ChatWindow.js`
3. Add API key to environment variables
4. Update documentation

## Security Notes

- API keys are stored in environment variables
- All data is stored locally in SQLite
- No external data transmission beyond AI API calls
- CORS is configured for local development only

## Performance Tips

- Use SSD storage for better database performance
- Allocate sufficient RAM to Docker (4GB+ recommended)
- Monitor API usage to avoid rate limits
- Regular database backups for important conversations
- **uv provides faster dependency resolution** compared to pip 