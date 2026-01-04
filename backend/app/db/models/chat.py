from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Index, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.base import Base


class ChatMessage(Base):
    """Chat message model"""

    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    retrieved_chunk_ids = Column(ARRAY(UUID(as_uuid=True)), nullable=True)  # For citations
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Index for efficient queries
    __table_args__ = (Index("idx_chat_messages_pdf_id_created_at", "pdf_id", "created_at"),)

    def __repr__(self):
        return f"<ChatMessage {self.role} for PDF {self.pdf_id}>"
