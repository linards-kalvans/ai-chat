from pydantic import BaseModel, ConfigDict
from typing import List
from datetime import datetime

class FileUploadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    created_at: datetime

class FileUploadList(BaseModel):
    files: List[FileUploadResponse] 