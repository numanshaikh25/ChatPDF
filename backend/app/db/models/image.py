from sqlalchemy import Column, String, BigInteger, Text, DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.base import Base


class Image(Base):
    __tablename__ = "images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    minio_key = Column(String(500), nullable=False)
    file_size = Column(BigInteger, nullable=False)
    status = Column(String(20), nullable=False, default="ready")
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    def __repr__(self):
        return f"<Image {self.filename} (status={self.status})>"


class ImageMessage(Base):
    __tablename__ = "image_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    image_id = Column(
        UUID(as_uuid=True), ForeignKey("images.id", ondelete="CASCADE"), nullable=False
    )
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("idx_image_messages_image_id_created_at", "image_id", "created_at"),
    )

    def __repr__(self):
        return f"<ImageMessage {self.role} for Image {self.image_id}>"
