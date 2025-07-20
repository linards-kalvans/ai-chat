import os
import aiofiles
from typing import List, Optional
from fastapi import UploadFile, HTTPException
import pypdf
from docx import Document
import tempfile

class FileService:
    ALLOWED_EXTENSIONS = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc': 'application/msword',
        '.txt': 'text/plain',
        '.md': 'text/markdown',
        '.rtf': 'application/rtf'
    }
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    @classmethod
    def is_allowed_file(cls, filename: str) -> bool:
        """Check if file extension is allowed"""
        ext = os.path.splitext(filename.lower())[1]
        return ext in cls.ALLOWED_EXTENSIONS
    
    @classmethod
    def get_file_type(cls, filename: str) -> str:
        """Get file type from filename"""
        ext = os.path.splitext(filename.lower())[1]
        return ext[1:] if ext else 'unknown'
    
    @classmethod
    async def validate_file(cls, file: UploadFile) -> None:
        """Validate uploaded file"""
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        if not cls.is_allowed_file(file.filename):
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed types: {', '.join(cls.ALLOWED_EXTENSIONS.keys())}"
            )
        
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        size = file.file.tell()
        file.file.seek(0)  # Reset to beginning
        
        if size > cls.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large. Maximum size: {cls.MAX_FILE_SIZE // (1024*1024)}MB"
            )
    
    @classmethod
    async def extract_text_from_pdf(cls, file_path: str) -> str:
        """Extract text from PDF file"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = pypdf.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error extracting text from PDF: {str(e)}")
    
    @classmethod
    async def extract_text_from_docx(cls, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error extracting text from DOCX: {str(e)}")
    
    @classmethod
    async def extract_text_from_txt(cls, file_path: str) -> str:
        """Extract text from plain text file"""
        try:
            async with aiofiles.open(file_path, 'r', encoding='utf-8') as file:
                content = await file.read()
            return content.strip()
        except UnicodeDecodeError:
            # Try with different encoding
            try:
                async with aiofiles.open(file_path, 'r', encoding='latin-1') as file:
                    content = await file.read()
                return content.strip()
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Error reading text file: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading text file: {str(e)}")
    
    @classmethod
    async def extract_text_from_file(cls, file: UploadFile) -> str:
        """Extract text content from uploaded file"""
        await cls.validate_file(file)
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            # Write uploaded file to temp file
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            file_type = cls.get_file_type(file.filename)
            
            if file_type == 'pdf':
                return await cls.extract_text_from_pdf(temp_file_path)
            elif file_type == 'docx':
                return await cls.extract_text_from_docx(temp_file_path)
            elif file_type in ['txt', 'md']:
                return await cls.extract_text_from_txt(temp_file_path)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_type}")
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    
    @classmethod
    def format_file_context(cls, files: List[dict]) -> str:
        """Format file content as context for AI prompt"""
        if not files:
            return ""
        
        context = "\n\n--- CONTEXT FILES ---\n"
        for file in files:
            context += f"\nFile: {file['original_filename']}\n"
            context += f"Type: {file['file_type']}\n"
            context += f"Content:\n{file['content']}\n"
            context += "-" * 50 + "\n"
        
        context += "\n--- END CONTEXT FILES ---\n\n"
        return context 