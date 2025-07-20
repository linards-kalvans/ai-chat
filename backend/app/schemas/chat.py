from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class ChatCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    title: str
    model_provider: str = "openai"
    model_name: str = "gpt-3.5-turbo"

class ChatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    
    id: int
    title: str
    model_provider: str
    model_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    message_count: Optional[int] = 0

class MessageCreate(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    content: str
    model_provider: str = "openai"
    model_name: str = "gpt-3.5-turbo"
    think_mode: bool = False
    deep_research_mode: bool = False

class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    chat_id: int
    role: str
    content: str
    created_at: datetime

class ChatList(BaseModel):
    chats: List[ChatResponse]
    total: int
    skip: int
    limit: int 