from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.chat import router as chat_router
from .api.files import router as files_router
from .core.database import engine, Base
from .core.config import settings
from .models import chat as chat_models  # Import models to register them
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables with error handling
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Failed to create database tables: {e}")
    # Don't fail the app startup, let it continue

app = FastAPI(title="AI Chat API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router, prefix="/api")
app.include_router(files_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "AI Chat API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-chat-api"} 