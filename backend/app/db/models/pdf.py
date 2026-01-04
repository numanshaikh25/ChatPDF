from sqlalchemy import Column, String, BigInteger, Integer, Text, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid

from app.db.base import Base


class PDF(Base):
    """PDF document model"""

    __tablename__ = "pdfs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    minio_key = Column(String(500), nullable=False)  # Object key in MinIO
    file_size = Column(BigInteger, nullable=False)
    total_pages = Column(Integer, nullable=True)
    status = Column(
        String(20),
        nullable=False,
        default="pending",
        # pending, processing, completed, failed
    )
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self):
        return f"<PDF {self.filename} (status={self.status})>"


class PDFChunk(Base):
    """PDF chunk with embeddings for vector search"""

    __tablename__ = "pdf_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id", ondelete="CASCADE"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    chunk_index = Column(Integer, nullable=False)
    embedding = Column(Vector(1536), nullable=True)  # OpenAI text-embedding-3-small dimension
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Indexes
    __table_args__ = (
        Index("idx_pdf_chunks_pdf_id", "pdf_id"),
        # Vector index will be created via migration (ivfflat)
    )

    def __repr__(self):
        return f"<PDFChunk {self.id} (pdf_id={self.pdf_id}, chunk={self.chunk_index})>"
