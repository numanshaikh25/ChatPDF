import logging
from uuid import uuid4

from app.config import settings
from app.db.models import PDF
from app.db.session import get_db
from app.schemas.pdf import (
    DeletePDFResponse,
    InitUploadRequest,
    InitUploadResponse,
    PDFListResponse,
    PDFStatusResponse,
)
from app.services.minio_service import minio_service
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/init-upload", response_model=InitUploadResponse)
async def initialize_upload(
    request: InitUploadRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Initialize PDF upload - returns Tusd upload URL with metadata
    """
    # Validate file size
    if request.file_size > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed ({settings.max_file_size} bytes)",
        )

    # Validate file extension
    if not request.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        # Generate unique ID
        pdf_id = uuid4()

        # Create PDF record in database
        pdf = PDF(
            id=pdf_id,
            filename=request.filename,
            minio_key=f"pdfs/{pdf_id}.pdf",  # Will be updated by Tusd webhook
            file_size=request.file_size,
            status="pending",
        )
        db.add(pdf)
        await db.commit()

        logger.info(f"Created PDF record: {pdf_id}")

        # Return the Tusd endpoint URL
        # The client will send metadata (including pdf_id) in the Upload-Metadata header
        return InitUploadResponse(
            pdf_id=str(pdf_id),
            tusd_upload_url=settings.tusd_public_endpoint,
            message="Upload initialized successfully. Use Tusd endpoint to upload file.",
        )

    except Exception as e:
        logger.error(f"Error initializing upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to initialize upload: {str(e)}")


@router.post("/upload-complete")
async def handle_upload_complete(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Tusd webhook handler - called when upload completes
    This endpoint is called by Tusd server, not the client
    """
    try:
        # Parse Tusd JSON body
        body = await request.json()
        logger.info(f"Tusd webhook received: {body.get('Type')}")

        # Extract upload info from the JSON structure
        event = body.get("Event", {})
        upload_info = event.get("Upload", {})
        upload_id = upload_info.get("ID")
        metadata = upload_info.get("MetaData", {})

        logger.info(f"Upload-ID: {upload_id}, Metadata: {metadata}")

        pdf_id_str = metadata.get("pdf_id")
        filename = metadata.get("filename")

        if not pdf_id_str:
            logger.error("No pdf_id in Tusd metadata")
            raise HTTPException(status_code=400, detail="Missing pdf_id in metadata")

        # Find PDF record
        result = await db.execute(select(PDF).where(PDF.id == pdf_id_str))
        pdf = result.scalar_one_or_none()

        if not pdf:
            logger.error(f"PDF not found: {pdf_id_str}")
            raise HTTPException(status_code=404, detail="PDF not found")

        # Update PDF record with MinIO key from Tusd
        # Tusd stores files with just the hash part of the upload ID (before the +)
        minio_key = upload_id.split("+")[0] if "+" in upload_id else upload_id
        pdf.minio_key = minio_key
        pdf.status = "uploaded"

        await db.commit()

        logger.info(f"PDF {pdf_id_str} uploaded successfully to MinIO: {minio_key}")

        # Trigger Inngest background processing job
        import inngest
        from app.inngest.client import inngest_client

        await inngest_client.send(
            inngest.Event(
                name="pdf/process",
                data={"pdf_id": str(pdf_id_str), "minio_key": minio_key},
            )
        )

        logger.info(f"Triggered Inngest processing job for PDF {pdf_id_str}")

        return {"status": "ok", "pdf_id": str(pdf_id_str), "message": "Upload completed"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling upload completion: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process upload: {str(e)}")


@router.get("/list", response_model=PDFListResponse)
async def list_pdfs(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """
    List all PDFs with their status
    """
    try:
        # Get total count
        count_result = await db.execute(select(PDF))
        all_pdfs = count_result.scalars().all()
        total = len(all_pdfs)

        # Get paginated results
        result = await db.execute(
            select(PDF).order_by(PDF.created_at.desc()).offset(skip).limit(limit)
        )
        pdfs = result.scalars().all()

        return PDFListResponse(
            pdfs=[PDFStatusResponse.model_validate(pdf) for pdf in pdfs],
            total=total,
        )

    except Exception as e:
        logger.error(f"Error listing PDFs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list PDFs: {str(e)}")


@router.get("/{pdf_id}", response_model=PDFStatusResponse)
async def get_pdf_details(
    pdf_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get PDF details by ID
    """
    try:
        result = await db.execute(select(PDF).where(PDF.id == pdf_id))
        pdf = result.scalar_one_or_none()

        if not pdf:
            raise HTTPException(status_code=404, detail="PDF not found")

        return PDFStatusResponse.model_validate(pdf)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting PDF details: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get PDF: {str(e)}")


@router.get("/{pdf_id}/status", response_model=PDFStatusResponse)
async def get_pdf_status(
    pdf_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get PDF processing status (same as get_pdf_details but dedicated endpoint)
    """
    return await get_pdf_details(pdf_id, db)


@router.delete("/{pdf_id}", response_model=DeletePDFResponse)
async def delete_pdf(
    pdf_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Delete PDF and all related data from MinIO and database
    """
    try:
        # Find PDF
        result = await db.execute(select(PDF).where(PDF.id == pdf_id))
        pdf = result.scalar_one_or_none()

        if not pdf:
            raise HTTPException(status_code=404, detail="PDF not found")

        # Delete from MinIO
        if pdf.minio_key:
            try:
                minio_service.delete_file(pdf.minio_key)
                logger.info(f"Deleted file from MinIO: {pdf.minio_key}")
            except Exception as e:
                logger.warning(f"Failed to delete from MinIO: {e}")

        # Delete from database (cascades to chunks and chat messages)
        await db.execute(delete(PDF).where(PDF.id == pdf_id))
        await db.commit()

        logger.info(f"Deleted PDF: {pdf_id}")

        return DeletePDFResponse(
            message="PDF and all related data deleted successfully",
            pdf_id=pdf_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete PDF: {str(e)}")
