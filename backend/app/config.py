import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/chat_history.db")
    
    # API Keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "your_openai_api_key_here")
    xai_api_key: str = os.getenv("XAI_API_KEY", "your_xai_api_key_here")
    
    # CORS settings for cloud deployment
    cors_origins: list = ["*"]  # Configure for production
    allowed_hosts: list = ["*"]  # Configure for production
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    
    class Config:
        env_file = ".env"

settings = Settings() 