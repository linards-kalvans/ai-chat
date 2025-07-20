from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import uuid
import os
from ..core.database import get_db
from ..models.chat import FileUpload as FileUploadModel
from ..services.file_service import FileService
from ..schemas.file import FileUploadResponse, FileUploadList

router = APIRouter()

@router.post("/chats/{chat_id}/files", response_model=FileUploadResponse)
async def upload_file(
    chat_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a file to a chat for context"""
    try:
        # Extract text content from file
        content = await FileService.extract_text_from_file(file)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Create file upload record
        file_upload = FileUploadModel(
            chat_id=chat_id,
            filename=unique_filename,
            original_filename=file.filename,
            file_type=FileService.get_file_type(file.filename),
            file_size=len(content),
            content=content
        )
        
        db.add(file_upload)
        db.commit()
        db.refresh(file_upload)
        
        return FileUploadResponse(
            id=file_upload.id,
            filename=file_upload.filename,
            original_filename=file_upload.original_filename,
            file_type=file_upload.file_type,
            file_size=file_upload.file_size,
            created_at=file_upload.created_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chats/{chat_id}/files", response_model=FileUploadList)
async def get_chat_files(
    chat_id: int,
    db: Session = Depends(get_db)
):
    """Get all files uploaded to a chat"""
    files = db.query(FileUploadModel).filter(FileUploadModel.chat_id == chat_id).all()
    
    return FileUploadList(
        files=[
            FileUploadResponse(
                id=file.id,
                filename=file.filename,
                original_filename=file.original_filename,
                file_type=file.file_type,
                file_size=file.file_size,
                created_at=file.created_at
            ) for file in files
        ]
    )

@router.delete("/chats/{chat_id}/files/{file_id}")
async def delete_file(
    chat_id: int,
    file_id: int,
    db: Session = Depends(get_db)
):
    """Delete a file from a chat"""
    file = db.query(FileUploadModel).filter(
        FileUploadModel.id == file_id,
        FileUploadModel.chat_id == chat_id
    ).first()
    
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    
    db.delete(file)
    db.commit()
    
    return {"message": "File deleted successfully"} 