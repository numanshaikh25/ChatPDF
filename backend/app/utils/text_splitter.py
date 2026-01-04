from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Dict
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class PDFTextSplitter:
    """Text splitter for PDF content"""

    def __init__(
        self,
        chunk_size: int = None,
        chunk_overlap: int = None,
    ):
        """
        Initialize text splitter

        Args:
            chunk_size: Maximum chunk size (default from settings)
            chunk_overlap: Overlap between chunks (default from settings)
        """
        self.chunk_size = chunk_size or settings.chunk_size
        self.chunk_overlap = chunk_overlap or settings.chunk_overlap

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def split_text(self, text: str) -> List[str]:
        """
        Split text into chunks

        Args:
            text: Text to split

        Returns:
            List of text chunks
        """
        chunks = self.splitter.split_text(text)
        logger.info(f"Split text into {len(chunks)} chunks")
        return chunks

    def split_pages(self, pages: List[Dict[str, any]]) -> List[Dict[str, any]]:
        """
        Split pages into chunks while preserving page numbers

        Args:
            pages: List of dicts with 'page_number' and 'text'

        Returns:
            List of dicts with 'chunk_text', 'page_number', 'chunk_index'
        """
        all_chunks = []
        chunk_index = 0

        for page in pages:
            page_num = page["page_number"]
            page_text = page["text"]

            # Split page text into chunks
            chunks = self.splitter.split_text(page_text)

            for chunk_text in chunks:
                all_chunks.append(
                    {
                        "chunk_text": chunk_text,
                        "page_number": page_num,
                        "chunk_index": chunk_index,
                    }
                )
                chunk_index += 1

        logger.info(f"Created {len(all_chunks)} chunks from {len(pages)} pages")
        return all_chunks


# Global splitter instance
text_splitter = PDFTextSplitter()
