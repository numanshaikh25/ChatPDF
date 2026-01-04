import logging

import inngest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.inngest.client import inngest_client
from app.services.minio_service import minio_service
from app.services.embeddings import embedding_service
from app.utils.pdf_utils import extract_text_from_pdf_bytes
from app.utils.text_splitter import text_splitter
from app.db.models import PDF, PDFChunk
from app.config import settings

logger = logging.getLogger(__name__)

# Create async database engine for Inngest functions
engine = create_async_engine(settings.database_url)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@inngest_client.create_function(
    fn_id="pdf-process",
    trigger=inngest.TriggerEvent(event="pdf/process"),
)
async def process_pdf(ctx, step):
    """
    Background job to process PDF:
    1. Update status to processing
    2. Download from MinIO, extract text, chunk, generate embeddings, and store

    Note: Steps 2-5 are combined into one step to avoid Inngest's output size limits
    when passing large extracted text data between steps.
    """
    pdf_id = ctx.event.data.get("pdf_id")
    minio_key = ctx.event.data.get("minio_key")

    logger.info(f"Starting PDF processing for {pdf_id}")

    try:
        # Step 1: Update status to processing
        async def update_status_processing():
            async with AsyncSessionLocal() as db:
                result = await db.execute(select(PDF).where(PDF.id == pdf_id))
                pdf = result.scalar_one_or_none()
                if pdf:
                    pdf.status = "processing"
                    await db.commit()
                    logger.info(f"Updated PDF status to processing: {pdf_id}")

        await step.run("update-status-processing", update_status_processing)

        # Step 2: Process PDF (extract, chunk, embed, store)
        # Combined into one step to avoid passing large data between steps
        async def process_and_store():
            # Download PDF bytes from MinIO
            pdf_bytes = minio_service.download_file_bytes(minio_key)
            logger.info(f"Downloaded PDF bytes from {minio_key}")

            # Extract text from bytes
            extracted_data = extract_text_from_pdf_bytes(pdf_bytes)
            logger.info(
                f"Extracted {extracted_data['total_pages']} pages from PDF {pdf_id}"
            )

            # Chunk text
            chunks = text_splitter.split_pages(extracted_data["pages"])
            logger.info(f"Created {len(chunks)} chunks from PDF {pdf_id}")

            # Generate embeddings
            chunk_texts = [chunk["chunk_text"] for chunk in chunks]
            embeddings = await embedding_service.generate_embeddings_batch(chunk_texts)
            logger.info(f"Generated {len(embeddings)} embeddings for PDF {pdf_id}")

            # Store chunks and embeddings in database
            async with AsyncSessionLocal() as db:
                # Create PDFChunk records
                chunk_records = []
                for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                    chunk_record = PDFChunk(
                        pdf_id=pdf_id,
                        chunk_text=chunk["chunk_text"],
                        page_number=chunk["page_number"],
                        chunk_index=chunk["chunk_index"],
                        embedding=embedding,
                    )
                    chunk_records.append(chunk_record)

                db.add_all(chunk_records)

                # Update PDF with total pages and status
                result = await db.execute(select(PDF).where(PDF.id == pdf_id))
                pdf = result.scalar_one_or_none()
                if pdf:
                    pdf.total_pages = extracted_data["total_pages"]
                    pdf.status = "completed"

                await db.commit()
                logger.info(f"Stored {len(chunk_records)} chunks for PDF {pdf_id}")

            return {"total_pages": extracted_data["total_pages"], "total_chunks": len(chunks)}

        result = await step.run("process-and-store", process_and_store)

        logger.info(
            f"PDF processing completed successfully for {pdf_id}: "
            f"{result['total_pages']} pages, {result['total_chunks']} chunks"
        )

    except Exception as e:
        # Update status to failed
        logger.error(f"Error processing PDF {pdf_id}: {e}")

        async def update_status_failed():
            async with AsyncSessionLocal() as db:
                result = await db.execute(select(PDF).where(PDF.id == pdf_id))
                pdf = result.scalar_one_or_none()
                if pdf:
                    pdf.status = "failed"
                    pdf.error_message = str(e)
                    await db.commit()
                    logger.info(f"Updated PDF status to failed: {pdf_id}")

        await step.run("update-status-failed", update_status_failed)
        raise
