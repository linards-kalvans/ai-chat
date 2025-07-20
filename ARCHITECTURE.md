# AI Chat Application Architecture

## System Overview

The AI Chat Application is a modern, containerized web application that provides a unified interface for chatting with multiple AI providers (OpenAI and xAI). The system is designed with a microservices architecture, ensuring scalability, maintainability, and ease of deployment.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Services   │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (OpenAI/xAI)  │
│   Port: 3000    │    │   Port: 8000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│   Nginx         │    │   SQLite DB     │
│   (Reverse      │    │   (Local File)  │
│    Proxy)       │    │                 │
└─────────────────┘    └─────────────────┘
```

## Component Details

### 1. Frontend (React)
- **Technology**: React 18 with functional components and hooks
- **Styling**: Custom CSS with responsive design
- **State Management**: React useState and useEffect
- **Key Components**:
  - `App.js`: Main application orchestrator
  - `ChatList.js`: Sidebar with chat sessions
  - `ChatWindow.js`: Main chat interface
  - `api.js`: API client service

**Features**:
- Real-time chat interface
- Model selection (OpenAI/xAI)
- Chat history management
- Responsive design for mobile/desktop
- Error handling and loading states

### 2. Backend (FastAPI)
- **Technology**: FastAPI with SQLAlchemy ORM
- **Database**: SQLite with local file storage
- **API Design**: RESTful endpoints with Pydantic validation
- **Package Management**: uv for fast dependency resolution

**Key Modules**:
- `app/main.py`: FastAPI application setup
- `app/core/`: Configuration and database setup
- `app/models/`: SQLAlchemy database models
- `app/api/`: API routes and schemas
- `app/services/`: AI service integrations

**Dependency Management**:
- `pyproject.toml`: Modern Python project configuration
- `uv.lock`: Locked dependency versions for reproducible builds
- `uv`: Fast Python package manager for dependency resolution

**API Endpoints**:
```
GET    /api/chats              # List all chats
POST   /api/chats              # Create new chat
GET    /api/chats/{id}         # Get specific chat
DELETE /api/chats/{id}         # Delete chat
GET    /api/chats/{id}/messages # Get chat messages
POST   /api/chats/{id}/messages # Send message to AI
```

### 3. AI Service Integration
- **OpenAI**: Official OpenAI Python client
- **xAI**: HTTP client with REST API integration
- **Error Handling**: Graceful fallbacks and user feedback
- **Rate Limiting**: Built-in API rate limiting support

### 4. Database Design
**Chat Table**:
```sql
CREATE TABLE chats (
    id INTEGER PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    model_provider VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
);
```

**Message Table**:
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY,
    chat_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id)
);
```

### 5. Containerization
- **Backend Container**: Python 3.11 with FastAPI and uv
- **Frontend Container**: Node.js 18 → Nginx (multi-stage build)
- **Docker Compose**: Orchestration with health checks
- **Volume Mounts**: Persistent data storage

## Data Flow

### 1. Message Sending Flow
```
User Input → Frontend → Backend API → AI Service → Response → Database → Frontend
```

### 2. Chat Loading Flow
```
Frontend Request → Backend API → Database Query → JSON Response → Frontend Render
```

### 3. Error Handling Flow
```
Error → Backend Validation → HTTP Error Response → Frontend Error Display
```

## Security Considerations

### 1. API Key Management
- Environment variable storage
- No hardcoded credentials
- Secure Docker secrets support

### 2. Data Privacy
- Local SQLite storage
- No external data transmission beyond AI APIs
- User data remains on local machine

### 3. CORS Configuration
- Restricted to localhost origins
- Secure cross-origin requests
- Development/production environment support

## Performance Optimizations

### 1. Frontend
- React.memo for component optimization
- Efficient state management
- Lazy loading for large chat histories
- CSS animations for smooth UX

### 2. Backend
- Async/await for non-blocking operations
- Database connection pooling
- Efficient SQL queries with proper indexing
- Response caching for static data
- **uv for faster dependency resolution**

### 3. Containerization
- Multi-stage builds for smaller images
- Layer caching for faster builds
- Health checks for service monitoring
- Resource limits and constraints

## Deployment Options

### 1. Docker Compose (Recommended)
```bash
docker-compose up --build
```

### 2. Local Development with uv
```bash
# Backend
cd backend && uv sync && uv run uvicorn app.main:app --reload

# Frontend
cd frontend && npm start
```

### 3. Local Development with pip
```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# Frontend
cd frontend && npm start
```

### 4. Production Deployment
- Kubernetes deployment
- Load balancer configuration
- SSL/TLS termination
- Monitoring and logging

## Development Workflow

### 1. Dependency Management with uv
```bash
# Install dependencies
uv sync

# Add new dependency
uv add package-name

# Add development dependency
uv add --dev package-name

# Run scripts
uv run python script.py
uv run pytest
uv run black .
```

### 2. Code Quality Tools
- **Black**: Code formatting
- **isort**: Import sorting
- **flake8**: Linting
- **mypy**: Type checking
- **pytest**: Testing

## Monitoring and Logging

### 1. Health Checks
- Backend: `/health` endpoint
- Frontend: Container health status
- Database: Connection validation

### 2. Logging
- Structured logging with timestamps
- Error tracking and reporting
- Performance metrics collection

### 3. Metrics
- API response times
- Database query performance
- Container resource usage
- User interaction analytics

## Future Enhancements

### 1. Features
- User authentication and authorization
- Chat export functionality
- Message search and filtering
- Custom model configurations
- Streaming responses

### 2. Technical Improvements
- PostgreSQL for production use
- Redis for caching
- WebSocket support for real-time updates
- GraphQL API for flexible queries
- Microservices decomposition

### 3. AI Integrations
- Additional AI providers (Anthropic, Google)
- Model fine-tuning support
- Custom prompt templates
- Conversation context management

## Troubleshooting

### Common Issues
1. **API Key Configuration**: Ensure `.env` file is properly configured
2. **Port Conflicts**: Check for existing services on ports 3000/8000
3. **Database Issues**: Verify SQLite file permissions
4. **CORS Errors**: Check allowed origins configuration
5. **uv Installation**: Ensure uv is properly installed for local development

### Debug Commands
```bash
# View logs
docker-compose logs -f

# Check service status
docker-compose ps

# Restart services
docker-compose restart

# Access container shell
docker-compose exec backend bash

# Local development with uv
cd backend && uv sync && uv run uvicorn app.main:app --reload
``` 