from sqlalchemy import String, BigInteger, Integer, Text, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector  # type: ignore
import uuid
from typing import Optional
from datetime import datetime

from app.db.base import Base


class PDF(Base):
    """PDF document model"""

    __tablename__ = "pdfs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    minio_key: Mapped[str] = mapped_column(String(500), nullable=False)  # Object key in MinIO
    file_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    total_pages: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    word_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        # pending, processing, completed, failed
    )
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self):
        return f"<PDF {self.filename} (status={self.status})>"


class PDFChunk(Base):
    """PDF chunk with embeddings for vector search"""

    __tablename__ = "pdf_chunks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pdf_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pdfs.id", ondelete="CASCADE"), nullable=False
    )
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    embedding: Mapped[Optional[Vector]] = mapped_column(
        Vector(1536), nullable=True
    )  # OpenAI text-embedding-3-small dimension
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # Indexes
    __table_args__ = (
        Index("idx_pdf_chunks_pdf_id", "pdf_id"),
        # Vector index will be created via migration (ivfflat)
    )

    def __repr__(self):
        return f"<PDFChunk {self.id} (pdf_id={self.pdf_id}, chunk={self.chunk_index})>"
