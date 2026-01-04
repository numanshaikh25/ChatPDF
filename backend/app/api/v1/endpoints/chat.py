from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging
import json

from app.db.session import get_db
from app.db.models import ChatMessage as ChatMessageModel
from app.schemas.chat import (
    ChatQueryRequest,
    ChatQueryResponse,
    ChatHistoryResponse,
    ChatMessage,
)
from app.services.chat_service import chat_service
from app.services.llm_service import llm_service
from app.services.vector_store import vector_store_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/query", response_model=ChatQueryResponse)
async def chat_query(
    request: ChatQueryRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Send a chat message and get response using RAG
    """
    try:
        # Convert chat history to dict format
        chat_history = [msg.model_dump() for msg in request.chat_history]

        # Process query using RAG
        result = await chat_service.process_query(
            db=db,
            pdf_id=request.pdf_id,
            query=request.message,
            chat_history=chat_history,
        )

        return ChatQueryResponse(
            response=result["response"],
            retrieved_chunks=result["retrieved_chunks"],
        )

    except Exception as e:
        logger.error(f"Error processing chat query: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process query: {str(e)}")


@router.post("/stream")
async def chat_stream(
    request: ChatQueryRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Streaming chat response using Server-Sent Events (SSE)
    """
    try:
        # Convert chat history to dict format
        chat_history = [msg.model_dump() for msg in request.chat_history]

        # Retrieve similar chunks
        similar_chunks = await vector_store_service.search_similar_chunks(
            db=db,
            pdf_id=request.pdf_id,
            query=request.message,
        )

        logger.info(f"Retrieved {len(similar_chunks)} chunks for streaming query")

        # Save user message
        await chat_service.save_chat_message(
            db=db,
            pdf_id=request.pdf_id,
            role="user",
            content=request.message,
        )

        async def event_generator():
            """Generate SSE events"""
            full_response = ""

            try:
                # Stream response from LLM
                async for chunk in llm_service.generate_response_stream(
                    query=request.message,
                    context_chunks=similar_chunks,
                    chat_history=chat_history,
                ):
                    full_response += chunk
                    # Send SSE event
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"

                # Save assistant message
                chunk_ids = [chunk["id"] for chunk in similar_chunks]
                await chat_service.save_chat_message(
                    db=db,
                    pdf_id=request.pdf_id,
                    role="assistant",
                    content=full_response,
                    retrieved_chunk_ids=chunk_ids,
                )

                # Send done signal
                yield f"data: {json.dumps({'done': True})}\n\n"

            except Exception as e:
                logger.error(f"Error in streaming: {e}")
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
        )

    except Exception as e:
        logger.error(f"Error setting up streaming: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to stream response: {str(e)}")


@router.get("/history/{pdf_id}", response_model=ChatHistoryResponse)
async def get_chat_history(
    pdf_id: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """
    Get chat history for a PDF
    """
    try:
        # Query chat messages
        result = await db.execute(
            select(ChatMessageModel)
            .where(ChatMessageModel.pdf_id == pdf_id)
            .order_by(ChatMessageModel.created_at.desc())
            .limit(limit)
        )
        messages = result.scalars().all()

        # Reverse to get chronological order
        messages = list(reversed(messages))

        # Convert to schema
        chat_messages = [
            ChatMessage(role=msg.role, content=msg.content) for msg in messages
        ]

        return ChatHistoryResponse(
            pdf_id=pdf_id,
            messages=chat_messages,
            total=len(chat_messages),
        )

    except Exception as e:
        logger.error(f"Error getting chat history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get chat history: {str(e)}")
