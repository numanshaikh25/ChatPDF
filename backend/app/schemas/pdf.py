from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class InitUploadRequest(BaseModel):
    """Request to initialize PDF upload"""

    filename: str = Field(..., description="PDF filename")
    file_size: int = Field(..., description="File size in bytes", gt=0)


class InitUploadResponse(BaseModel):
    """Response with Tusd upload URL"""

    pdf_id: str = Field(..., description="Generated PDF ID")
    tusd_upload_url: str = Field(..., description="Tusd endpoint URL for uploading")
    message: str = Field(default="Upload initialized successfully")


class PDFStatusResponse(BaseModel):
    """PDF processing status"""

    pdf_id: UUID = Field(..., validation_alias='id')
    filename: str
    status: str  # pending, processing, completed, failed
    file_size: int
    total_pages: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True


class PDFListResponse(BaseModel):
    """List of PDFs"""

    pdfs: list[PDFStatusResponse]
    total: int


class DeletePDFResponse(BaseModel):
    """Response after deleting PDF"""

    message: str
    pdf_id: str
