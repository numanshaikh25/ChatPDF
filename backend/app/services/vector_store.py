from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict
import logging

from app.db.models import PDFChunk
from app.services.embeddings import embedding_service
from app.config import settings

logger = logging.getLogger(__name__)


class VectorStoreService:
    """Service for vector similarity search using pgvector"""

    async def search_similar_chunks(
        self,
        db: AsyncSession,
        pdf_id: str,
        query: str,
        top_k: int = None,
        similarity_threshold: float = None,
    ) -> List[Dict]:
        """
        Search for similar chunks using vector similarity

        Args:
            db: Database session
            pdf_id: PDF document ID to search within
            query: Query text
            top_k: Number of results to return (default from settings)
            similarity_threshold: Minimum similarity score (default from settings)

        Returns:
            List of dicts with chunk info and similarity scores
        """
        top_k = top_k or settings.top_k_retrieval
        similarity_threshold = similarity_threshold or settings.similarity_threshold

        try:
            # Generate query embedding
            query_embedding = await embedding_service.generate_embedding(query)

            # Perform vector similarity search using pgvector
            # cosine_distance returns 0 for identical vectors, 2 for opposite
            # We convert to similarity score (1 - distance/2) for easier interpretation
            stmt = (
                select(
                    PDFChunk,
                    (1 - PDFChunk.embedding.cosine_distance(query_embedding) / 2).label(
                        "similarity"
                    ),
                )
                .where(PDFChunk.pdf_id == pdf_id)
                .order_by(PDFChunk.embedding.cosine_distance(query_embedding))
                .limit(top_k)
            )

            result = await db.execute(stmt)
            rows = result.all()

            # Filter by similarity threshold and format results
            similar_chunks = []
            for chunk, similarity in rows:
                if similarity >= similarity_threshold:
                    similar_chunks.append(
                        {
                            "id": str(chunk.id),
                            "chunk_text": chunk.chunk_text,
                            "page_number": chunk.page_number,
                            "chunk_index": chunk.chunk_index,
                            "similarity": float(similarity),
                        }
                    )

            logger.info(
                f"Found {len(similar_chunks)} similar chunks for query (pdf_id={pdf_id})"
            )

            return similar_chunks

        except Exception as e:
            logger.error(f"Error searching similar chunks: {e}")
            raise


# Global vector store service instance
vector_store_service = VectorStoreService()
