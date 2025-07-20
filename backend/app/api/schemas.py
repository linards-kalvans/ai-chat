from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class MessageBase(BaseModel):
    role: str
    content: str


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: int
    chat_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class ChatBase(BaseModel):
    title: str
    model_provider: str
    model_name: str


class ChatCreate(ChatBase):
    pass


class Chat(ChatBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: List[Message] = []
    
    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    id: int
    title: str
    model_provider: str
    model_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    message_count: int


class SendMessageRequest(BaseModel):
    content: str
    provider: str
    model: str
    thinkingMode: bool = False
    deepResearchMode: bool = False


class SendMessageResponse(BaseModel):
    message: Message
    assistant_response: Message
    chat: ChatResponse 