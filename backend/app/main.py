from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat
from app.database import engine
from app.models import chat as chat_models

# Create database tables
chat_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Chat API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chats", tags=["chats"])

@app.get("/")
async def root():
    return {"message": "AI Chat API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-chat-api"} 