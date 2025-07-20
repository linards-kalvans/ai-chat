from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # Database configuration
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./chat.db")
    
    # API Keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    
    # Server configuration
    host: str = "0.0.0.0"
    port: int = int(os.getenv("PORT", "8000"))
    
    # CORS configuration
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-frontend-app.fly.dev"  # Update this with your frontend domain
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings() 