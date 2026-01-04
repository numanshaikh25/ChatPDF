from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID


class ChatMessage(BaseModel):
    """Single chat message"""

    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatQueryRequest(BaseModel):
    """Request to send a chat message"""

    pdf_id: str = Field(..., description="PDF document ID")
    message: str = Field(..., description="User's question")
    chat_history: Optional[list[ChatMessage]] = Field(
        default=[], description="Previous chat messages for context"
    )


class RetrievedChunk(BaseModel):
    """Retrieved text chunk with metadata"""

    chunk_text: str
    page_number: Optional[int] = None
    similarity_score: float


class ChatQueryResponse(BaseModel):
    """Response to chat query"""

    response: str = Field(..., description="Assistant's response")
    retrieved_chunks: Optional[list[RetrievedChunk]] = Field(
        default=[], description="Source chunks used for the response"
    )


class ChatHistoryResponse(BaseModel):
    """Chat history for a PDF"""

    pdf_id: UUID
    messages: list[ChatMessage]
    total: int
