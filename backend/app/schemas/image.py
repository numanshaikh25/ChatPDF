from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class ImageStatusResponse(BaseModel):
    image_id: UUID = Field(..., validation_alias="id")
    filename: str
    status: str
    file_size: int
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True


class ImageListResponse(BaseModel):
    images: list[ImageStatusResponse]
    total: int


class DeleteImageResponse(BaseModel):
    message: str
    image_id: str


class ImageChatMessage(BaseModel):
    role: str
    content: str


class ImageChatRequest(BaseModel):
    image_id: str = Field(..., description="Image ID")
    message: str = Field(..., description="User question about the image")
    chat_history: Optional[list[ImageChatMessage]] = Field(default=[])


class ImageChatResponse(BaseModel):
    response: str


class ImageChatHistoryResponse(BaseModel):
    image_id: UUID
    messages: list[ImageChatMessage]
    total: int
