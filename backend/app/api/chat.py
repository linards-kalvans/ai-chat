from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging
import httpx
from datetime import datetime
from ..core.database import get_db
from ..core.config import settings
from ..models.chat import Chat, Message
from ..services.ai_service import ai_service
from . import schemas

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chats", tags=["chats"])


@router.get("/", response_model=List[schemas.ChatResponse])
def get_chats(db: Session = Depends(get_db)):
    """Get all chat sessions"""
    chats = db.query(Chat).all()
    result = []
    for chat in chats:
        message_count = db.query(Message).filter(Message.chat_id == chat.id).count()
        result.append(schemas.ChatResponse(
            id=chat.id,
            title=chat.title,
            model_provider=chat.model_provider,
            model_name=chat.model_name,
            created_at=chat.created_at,
            updated_at=chat.updated_at,
            message_count=message_count
        ))
    return result


@router.post("/", response_model=schemas.Chat)
def create_chat(chat: schemas.ChatCreate, db: Session = Depends(get_db)):
    """Create a new chat session"""
    db_chat = Chat(**chat.dict())
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat


@router.get("/{chat_id}", response_model=schemas.Chat)
def get_chat(chat_id: int, db: Session = Depends(get_db)):
    """Get a specific chat with all messages"""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@router.delete("/{chat_id}")
def delete_chat(chat_id: int, db: Session = Depends(get_db)):
    """Delete a chat session"""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted successfully"}


@router.get("/{chat_id}/messages", response_model=List[schemas.Message])
def get_messages(chat_id: int, db: Session = Depends(get_db)):
    """Get all messages for a chat"""
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
    return messages


@router.get("/available-models/{provider}")
async def get_models(provider: str):
    """Get available models for a provider"""
    if provider.lower() == "openai":
        return {
            "models": [
                {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo"},
                {"id": "gpt-4", "name": "GPT-4"},
                {"id": "gpt-4-turbo", "name": "GPT-4 Turbo"}
            ]
        }
    elif provider.lower() == "xai":
        # Try to fetch models from xAI API
        if not settings.xai_api_key or settings.xai_api_key == "your_xai_api_key_here":
            return {"models": [], "error": "xAI API key not configured"}
        
        try:
            url = "https://api.x.ai/v1/models"
            headers = {
                "Authorization": f"Bearer {settings.xai_api_key}",
                "Content-Type": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers)
                if response.status_code == 200:
                    result = response.json()
                    return {"models": result.get("data", [])}
                else:
                    logger.error(f"Failed to fetch xAI models: {response.status_code} - {response.text}")
                    return {"models": [], "error": f"Failed to fetch models: {response.status_code}"}
        except Exception as e:
            logger.error(f"Error fetching xAI models: {str(e)}")
            return {"models": [], "error": f"Error fetching models: {str(e)}"}
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")


@router.post("/{chat_id}/messages", response_model=schemas.SendMessageResponse)
async def send_message(
    chat_id: int,
    request: schemas.SendMessageRequest,
    db: Session = Depends(get_db)
):
    """Send a message to the AI and get response"""
    logger.info(f"Received message request: chat_id={chat_id}, provider={request.provider}, model={request.model}")
    
    # Get or create chat
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        # Create new chat if it doesn't exist
        chat = Chat(
            title=request.content[:50] + "..." if len(request.content) > 50 else request.content,
            model_provider=request.provider,
            model_name=request.model
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)
        logger.info(f"Created new chat with id: {chat.id}")
    
    # Save user message
    user_message = Message(
        chat_id=chat.id,
        role="user",
        content=request.content
    )
    db.add(user_message)
    db.commit()
    db.refresh(user_message)
    logger.info(f"Saved user message with id: {user_message.id}")
    
    # Get conversation history
    messages = db.query(Message).filter(Message.chat_id == chat.id).order_by(Message.created_at).all()
    conversation = [{"role": msg.role, "content": msg.content} for msg in messages]
    logger.info(f"Conversation history has {len(conversation)} messages")
    
    try:
        # Get AI response
        logger.info(f"Calling AI service with provider: {request.provider}, model: {request.model}")
        ai_response_content = await ai_service.chat(
            conversation,
            request.provider,
            request.model,
            request.thinkingMode,
            request.deepResearchMode
        )
        logger.info("AI service call successful")
        
        # Save AI response
        ai_message = Message(
            chat_id=chat.id,
            role="assistant",
            content=ai_response_content
        )
        db.add(ai_message)
        
        # Update chat's updated_at timestamp
        chat.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(ai_message)
        db.refresh(chat)
        logger.info(f"Saved AI response with id: {ai_message.id}")
        
        return schemas.SendMessageResponse(
            message=user_message,
            assistant_response=ai_message,
            chat=schemas.ChatResponse(
                id=chat.id,
                title=chat.title,
                model_provider=chat.model_provider,
                model_name=chat.model_name,
                created_at=chat.created_at,
                updated_at=chat.updated_at,
                message_count=db.query(Message).filter(Message.chat_id == chat.id).count()
            )
        )
        
    except Exception as e:
        logger.error(f"Error in AI service call: {str(e)}")
        # Remove user message if AI call failed
        db.delete(user_message)
        db.commit()
        logger.info("Removed user message due to AI service failure")
        
        # Provide more specific error messages
        if "API key not configured" in str(e):
            raise HTTPException(
                status_code=400, 
                detail=f"{request.provider.upper()} API key not configured. Please check your environment variables."
            )
        elif "xAI API error" in str(e):
            raise HTTPException(
                status_code=400,
                detail="xAI API error. Please check your xAI API key and ensure it's valid."
            )
        elif "OpenAI API error" in str(e):
            raise HTTPException(
                status_code=400,
                detail="OpenAI API error. Please check your OpenAI API key and ensure it's valid."
            )
        else:
            raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}") 