from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models.chat import Chat, Message, FileUpload
from ..schemas.chat import ChatCreate, ChatResponse, MessageCreate, MessageResponse, ChatList
from ..services.ai_service import ai_service
from ..services.file_service import FileService
from .files import router as files_router
import json

router = APIRouter()

# Include files router
router.include_router(files_router, prefix="/api")

@router.post("/chats", response_model=ChatResponse)
def create_chat(chat: ChatCreate, db: Session = Depends(get_db)):
    """Create a new chat"""
    db_chat = Chat(
        title=chat.title,
        model_provider=chat.model_provider,
        model_name=chat.model_name
    )
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat

@router.get("/chats", response_model=ChatList)
def get_chats(
    skip: int = 0, 
    limit: int = 50,  # Increased from 20 to 50
    db: Session = Depends(get_db)
):
    """Get all chats with pagination"""
    total = db.query(Chat).count()
    # Use updated_at if available, otherwise use created_at for sorting
    chats = db.query(Chat).order_by(
        Chat.updated_at.desc().nullslast(),
        Chat.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    # Add message count to each chat
    chats_with_counts = []
    for chat in chats:
        message_count = db.query(Message).filter(Message.chat_id == chat.id).count()
        chat_dict = ChatResponse.model_validate(chat).model_dump()
        chat_dict['message_count'] = message_count
        chats_with_counts.append(chat_dict)
    
    return ChatList(
        chats=chats_with_counts,
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/chats/{chat_id}", response_model=ChatResponse)
def get_chat(chat_id: int, db: Session = Depends(get_db)):
    """Get a specific chat"""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@router.delete("/chats/{chat_id}")
def delete_chat(chat_id: int, db: Session = Depends(get_db)):
    """Delete a chat"""
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    db.delete(chat)
    db.commit()
    return {"message": "Chat deleted successfully"}

@router.get("/chats/{chat_id}/messages", response_model=List[MessageResponse])
def get_messages(chat_id: int, db: Session = Depends(get_db)):
    """Get all messages for a chat"""
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at).all()
    return [MessageResponse.model_validate(msg) for msg in messages]

@router.post("/chats/{chat_id}/messages", response_model=MessageResponse)
def send_message(
    chat_id: int, 
    message: MessageCreate, 
    db: Session = Depends(get_db)
):
    """Send a message to the AI and get a response"""
    # Get chat and validate
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get uploaded files for context
    files = db.query(FileUpload).filter(FileUpload.chat_id == chat_id).all()
    file_context = ""
    if files:
        file_data = [
            {
                'original_filename': file.original_filename,
                'file_type': file.file_type,
                'content': file.content
            } for file in files
        ]
        file_context = FileService.format_file_context(file_data)
    
    # Add file context to user message if files exist
    user_content = message.content
    if file_context:
        user_content = f"{file_context}User Question: {message.content}"
    
    # Save user message
    user_message = Message(
        chat_id=chat_id,
        role="user",
        content=message.content  # Save original message without context
    )
    db.add(user_message)
    db.commit()
    
    # Get AI response
    try:
        ai_response = ai_service.get_response(
            user_content,
            message.model_provider,
            message.model_name,
            message.think_mode,
            message.deep_research_mode
        )
        
        # Save AI response
        ai_message = Message(
            chat_id=chat_id,
            role="assistant",
            content=ai_response
        )
        db.add(ai_message)
        
        # Update chat title if it's the first message
        if not chat.title or chat.title == "New Chat":
            chat.title = message.content[:50] + "..." if len(message.content) > 50 else message.content
        
        # Update chat's model provider and name if this is the first message
        if not chat.model_provider or chat.model_provider == "openai":
            chat.model_provider = message.model_provider
            chat.model_name = message.model_name
        
        # Update chat's updated_at timestamp
        from datetime import datetime
        chat.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(ai_message)
        
        return ai_message
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chats/{chat_id}/messages/stream")
async def stream_message(
    chat_id: int,
    message: MessageCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """Stream a message response from the AI"""
    from fastapi.responses import StreamingResponse
    import asyncio
    
    # Get chat and validate
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Get uploaded files for context
    files = db.query(FileUpload).filter(FileUpload.chat_id == chat_id).all()
    file_context = ""
    if files:
        file_data = [
            {
                'original_filename': file.original_filename,
                'file_type': file.file_type,
                'content': file.content
            } for file in files
        ]
        file_context = FileService.format_file_context(file_data)
    
    # Add file context to user message if files exist
    user_content = message.content
    if file_context:
        user_content = f"{file_context}User Question: {message.content}"
    
    # Save user message
    user_message = Message(
        chat_id=chat_id,
        role="user",
        content=message.content  # Save original message without context
    )
    db.add(user_message)
    db.commit()
    
    # Update chat title if it's the first message
    if not chat.title or chat.title == "New Chat":
        chat.title = message.content[:50] + "..." if len(message.content) > 50 else message.content

    # Update chat's model provider and name if this is the first message
    if not chat.model_provider or chat.model_provider == "openai":
        chat.model_provider = message.model_provider
        chat.model_name = message.model_name
    
    # Update chat's updated_at timestamp
    from datetime import datetime
    chat.updated_at = datetime.utcnow()
    db.commit()
    
    async def generate_stream():
        try:
            # Get streaming response from AI and accumulate content
            accumulated_content = ""
            async for chunk in ai_service.get_streaming_response(
                user_content,
                message.model_provider,
                message.model_name,
                message.think_mode,
                message.deep_research_mode
            ):
                accumulated_content += chunk
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            
            # Save the accumulated AI response
            ai_message = Message(
                chat_id=chat_id,
                role="assistant",
                content=accumulated_content
            )
            db.add(ai_message)
            db.commit()
            
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        }
    ) 