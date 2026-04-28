import logging
from uuid import uuid4

from app.config import settings
from app.db.models import Image, ImageMessage
from app.db.session import get_db
from app.schemas.image import (
    DeleteImageResponse,
    ImageChatHistoryResponse,
    ImageChatMessage,
    ImageChatRequest,
    ImageChatResponse,
    ImageListResponse,
    ImageStatusResponse,
)
from app.services.image_service import image_service
from app.services.minio_service import minio_service
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/webp"}
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


@router.post("/upload", response_model=ImageStatusResponse)
async def upload_image(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    content_type = file.content_type or ""
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if content_type not in ALLOWED_CONTENT_TYPES and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only image files are supported (PNG, JPEG, WEBP)",
        )

    data = await file.read()

    if len(data) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large (max 10 MB)",
        )

    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        image_id = uuid4()
        minio_key = f"images/{image_id}{ext or '.png'}"

        minio_service.upload_bytes(minio_key, data, content_type or "image/png")

        image = Image(
            id=image_id,
            filename=filename or f"image{ext or '.png'}",
            minio_key=minio_key,
            file_size=len(data),
            status="ready",
        )
        db.add(image)
        await db.commit()
        await db.refresh(image)

        logger.info(f"Uploaded image: {image_id}")
        return ImageStatusResponse.model_validate(image)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@router.get("/list", response_model=ImageListResponse)
async def list_images(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    try:
        count_result = await db.execute(select(Image))
        total = len(count_result.scalars().all())

        result = await db.execute(
            select(Image).order_by(Image.created_at.desc()).offset(skip).limit(limit)
        )
        images = result.scalars().all()

        return ImageListResponse(
            images=[ImageStatusResponse.model_validate(img) for img in images],
            total=total,
        )
    except Exception as e:
        logger.error(f"Error listing images: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list images: {str(e)}")


@router.post("/chat/query", response_model=ImageChatResponse)
async def image_chat_query(
    request: ImageChatRequest,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await db.execute(select(Image).where(Image.id == request.image_id))
        image = result.scalar_one_or_none()

        if not image:
            raise HTTPException(status_code=404, detail="Image not found")

        if image.status != "ready":
            raise HTTPException(status_code=400, detail="Image is not ready")

        history = [msg.model_dump() for msg in (request.chat_history or [])]

        response_text = await image_service.analyze_image(
            minio_key=image.minio_key,
            query=request.message,
            chat_history=history,
        )

        user_msg = ImageMessage(image_id=image.id, role="user", content=request.message)
        db.add(user_msg)
        assistant_msg = ImageMessage(image_id=image.id, role="assistant", content=response_text)
        db.add(assistant_msg)
        await db.commit()

        return ImageChatResponse(response=response_text)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image chat: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")


@router.get("/chat/history/{image_id}", response_model=ImageChatHistoryResponse)
async def get_image_chat_history(
    image_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await db.execute(
            select(ImageMessage)
            .where(ImageMessage.image_id == image_id)
            .order_by(ImageMessage.created_at.desc())
            .limit(limit)
        )
        messages = list(reversed(result.scalars().all()))

        return ImageChatHistoryResponse(
            image_id=image_id,
            messages=[ImageChatMessage(role=m.role, content=m.content) for m in messages],
            total=len(messages),
        )
    except Exception as e:
        logger.error(f"Error getting image chat history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")


@router.get("/{image_id}", response_model=ImageStatusResponse)
async def get_image(
    image_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await db.execute(select(Image).where(Image.id == image_id))
        image = result.scalar_one_or_none()

        if not image:
            raise HTTPException(status_code=404, detail="Image not found")

        return ImageStatusResponse.model_validate(image)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get image: {str(e)}")


@router.delete("/{image_id}", response_model=DeleteImageResponse)
async def delete_image(
    image_id: str,
    db: AsyncSession = Depends(get_db),
):
    try:
        result = await db.execute(select(Image).where(Image.id == image_id))
        image = result.scalar_one_or_none()

        if not image:
            raise HTTPException(status_code=404, detail="Image not found")

        if image.minio_key:
            try:
                minio_service.delete_file(image.minio_key)
            except Exception as e:
                logger.warning(f"Failed to delete image from MinIO: {e}")

        await db.execute(delete(Image).where(Image.id == image_id))
        await db.commit()

        logger.info(f"Deleted image: {image_id}")
        return DeleteImageResponse(message="Image deleted successfully", image_id=image_id)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete image: {str(e)}")
