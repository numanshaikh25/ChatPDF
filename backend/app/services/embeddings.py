from openai import AsyncOpenAI
from typing import List
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating text embeddings using OpenAI"""

    def __init__(self):
        """Initialize OpenAI client"""
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_embedding_model

    async def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text

        Args:
            text: Text to embed

        Returns:
            Embedding vector as list of floats
        """
        try:
            response = await self.client.embeddings.create(
                model=self.model,
                input=text,
            )
            embedding = response.data[0].embedding
            logger.debug(f"Generated embedding for text (length: {len(text)})")
            return embedding

        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise

    async def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts in batch

        Args:
            texts: List of texts to embed

        Returns:
            List of embedding vectors
        """
        try:
            # OpenAI allows up to 2048 texts per batch
            batch_size = 2048
            all_embeddings = []

            for i in range(0, len(texts), batch_size):
                batch = texts[i : i + batch_size]

                response = await self.client.embeddings.create(
                    model=self.model,
                    input=batch,
                )

                embeddings = [item.embedding for item in response.data]
                all_embeddings.extend(embeddings)

                logger.info(f"Generated {len(embeddings)} embeddings (batch {i // batch_size + 1})")

            return all_embeddings

        except Exception as e:
            logger.error(f"Error generating embeddings batch: {e}")
            raise


# Global embedding service instance
embedding_service = EmbeddingService()
