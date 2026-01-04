from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict
import logging

from app.services.vector_store import vector_store_service
from app.services.llm_service import llm_service
from app.db.models import ChatMessage
from app.schemas.chat import RetrievedChunk

logger = logging.getLogger(__name__)


class ChatService:
    """Service for handling chat interactions with RAG"""

    async def process_query(
        self,
        db: AsyncSession,
        pdf_id: str,
        query: str,
        chat_history: List[Dict] = None,
    ) -> Dict:
        """
        Process user query using RAG pipeline

        Args:
            db: Database session
            pdf_id: PDF document ID
            query: User's question
            chat_history: Previous chat messages

        Returns:
            Dict with response and retrieved chunks
        """
        try:
            # Step 1: Retrieve relevant chunks using vector search
            similar_chunks = await vector_store_service.search_similar_chunks(
                db=db,
                pdf_id=pdf_id,
                query=query,
            )

            logger.info(f"Retrieved {len(similar_chunks)} chunks for query")

            # Step 2: Generate response using LLM
            response = await llm_service.generate_response(
                query=query,
                context_chunks=similar_chunks,
                chat_history=chat_history,
            )

            # Step 3: Save to chat history
            await self.save_chat_message(
                db=db,
                pdf_id=pdf_id,
                role="user",
                content=query,
            )

            chunk_ids = [chunk["id"] for chunk in similar_chunks]
            await self.save_chat_message(
                db=db,
                pdf_id=pdf_id,
                role="assistant",
                content=response,
                retrieved_chunk_ids=chunk_ids,
            )

            # Format retrieved chunks for response
            retrieved_chunks = [
                RetrievedChunk(
                    chunk_text=chunk["chunk_text"],
                    page_number=chunk.get("page_number"),
                    similarity_score=chunk["similarity"],
                )
                for chunk in similar_chunks
            ]

            return {
                "response": response,
                "retrieved_chunks": retrieved_chunks,
            }

        except Exception as e:
            logger.error(f"Error processing query: {e}")
            raise

    async def save_chat_message(
        self,
        db: AsyncSession,
        pdf_id: str,
        role: str,
        content: str,
        retrieved_chunk_ids: List[str] = None,
    ):
        """
        Save chat message to database

        Args:
            db: Database session
            pdf_id: PDF document ID
            role: Message role ('user' or 'assistant')
            content: Message content
            retrieved_chunk_ids: IDs of chunks used (for assistant messages)
        """
        try:
            message = ChatMessage(
                pdf_id=pdf_id,
                role=role,
                content=content,
                retrieved_chunk_ids=retrieved_chunk_ids,
            )
            db.add(message)
            await db.commit()

            logger.info(f"Saved {role} message for PDF {pdf_id}")

        except Exception as e:
            logger.error(f"Error saving chat message: {e}")
            raise


# Global chat service instance
chat_service = ChatService()
