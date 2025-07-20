# AI Chat Application

A local chat application that provides a unified interface for xAI and OpenAI models with persistent chat history.

## Features

- **Multi-Model Support**: Chat with xAI (Grok-3, Grok-3-mini, Grok-4) and OpenAI (GPT-3.5, GPT-4) models
- **Thinking & Research Modes**: Toggle between thinking mode (step-by-step reasoning) and deep research mode (comprehensive analysis)
- **Markdown Rendering**: Rich text formatting with support for code blocks, tables, lists, and syntax highlighting
- **Full Conversation History**: Maintains complete chat context for follow-up questions
- **Persistent Local Storage**: SQLite database stored on your local machine (survives container restarts)
- **Modern UI**: React-based chat interface with real-time updates
- **Docker Support**: Easy deployment with Docker containers
- **API Management**: Secure API key management for different providers
- **Fast Dependencies**: uv Python package manager for faster builds

## Architecture

```
ai-chat-app/
├── backend/                 # FastAPI server
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration and utilities
│   │   ├── models/         # Database models
│   │   ├── services/       # AI service integrations
│   │   └── main.py         # FastAPI application
│   ├── pyproject.toml      # uv dependency specification
│   ├── uv.lock            # Locked dependency versions
│   ├── requirements.txt    # Compatibility file
│   └── Dockerfile          # Backend container
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API client
│   │   └── App.js          # Main application
│   ├── package.json        # Node.js dependencies
│   └── Dockerfile          # Frontend container
├── docker-compose.yml      # Multi-container setup
└── .env.example           # Environment variables template
```

## Quick Start

### Using Docker (Recommended)

1. Clone the repository
2. Copy `.env.example` to `.env` and configure your API keys:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` with your API keys:
   ```
   OPENAI_API_KEY=your_openai_key_here
   XAI_API_KEY=your_xai_key_here
   ```
4. Run with Docker Compose:
   ```bash
   docker-compose up --build
   ```
5. Open http://localhost:3000 in your browser

### Local Development

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

**Setup backend:**
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Backend Setup with pip (Alternative)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Endpoints

- `GET /api/chats` - Get all chat sessions
- `POST /api/chats` - Create new chat session
- `GET /api/chats/{chat_id}/messages` - Get messages for a chat
- `POST /api/chats/{chat_id}/messages` - Send message to AI
- `DELETE /api/chats/{chat_id}` - Delete chat session

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `XAI_API_KEY`: Your xAI API key
- `DATABASE_URL`: SQLite database path (default: `sqlite:///./data/chat_history.db`)

## Model Information

### xAI Models
- **Grok-3**: Full-featured model with reasoning capabilities
- **Grok-3-mini**: Faster, more efficient version of Grok-3
- **Grok-4**: Reasoning model (experimental - may have compatibility issues)

### OpenAI Models
- **GPT-3.5 Turbo**: Fast and efficient for most tasks
- **GPT-4**: More capable model for complex reasoning
- **GPT-4 Turbo**: Latest version with improved performance

### Response Modes
- **Normal Mode**: Standard responses with balanced creativity and accuracy
- **Thinking Mode**: Step-by-step reasoning with lower temperature (0.3) for more focused analysis
- **Deep Research Mode**: Comprehensive responses with higher token limits (2000) for detailed explanations
- **Combined Mode**: Both thinking and deep research modes active for maximum detail and reasoning

### Markdown Support
The chat interface automatically renders markdown formatting in AI responses:
- **Headers**: # H1, ## H2, ### H3, etc.
- **Code Blocks**: ```python, ```javascript, etc. with syntax highlighting
- **Inline Code**: `code` with background highlighting
- **Tables**: Full markdown table support with proper styling
- **Lists**: Bulleted and numbered lists
- **Formatting**: **Bold**, *Italic*, ~~Strikethrough~~
- **Links**: [Text](URL) with hover effects
- **Blockquotes**: > Quoted text with left border
- **Horizontal Rules**: --- for section breaks

## Development with uv

### Adding Dependencies
```bash
cd backend

# Add production dependency
uv add package-name

# Add development dependency
uv add --dev package-name

# Update all dependencies
uv sync
```

### Running Scripts
```bash
# Run with uv
uv run python script.py

# Run tests
uv run pytest

# Format code
uv run black .
uv run isort .
```

## Security Notes

- API keys are stored in environment variables
- All data is stored locally in SQLite
- No external data transmission beyond AI API calls
- CORS is configured for local development

## License

MIT License 