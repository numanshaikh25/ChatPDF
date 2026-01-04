"""PDF utilities using LangChain document loaders"""

import logging
from typing import Any, Dict, List

from langchain_community.document_loaders.parsers.pdf import PyPDFParser
from langchain_core.document_loaders import Blob

logger = logging.getLogger(__name__)


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Extract text from PDF bytes using LangChain's Blob and PyPDFParser.

    Args:
        pdf_bytes: PDF file as bytes

    Returns:
        Dictionary with full_text, pages, and total_pages
    """
    try:
        # Create a Blob from bytes data
        blob = Blob.from_data(
            data=pdf_bytes,
            mime_type="application/pdf",
        )

        # Parse the PDF using PyPDFParser (page mode for individual pages)
        parser = PyPDFParser(mode="page")
        documents = list(parser.lazy_parse(blob))

        # Convert LangChain Documents to our page format
        pages_text: List[Dict[str, Any]] = []
        for doc in documents:
            page_num = doc.metadata.get("page", 0) + 1  # LangChain uses 0-indexed pages
            pages_text.append({
                "page_number": page_num,
                "text": doc.page_content,
            })

        full_text = "\n\n".join([p["text"] for p in pages_text])
        total_pages = len(pages_text)

        logger.info(f"Extracted text from PDF bytes: {total_pages} pages")

        return {
            "full_text": full_text,
            "pages": pages_text,
            "total_pages": total_pages,
        }

    except Exception as e:
        logger.error(f"Error extracting text from PDF bytes: {e}")
        raise


def extract_text_from_pdf(pdf_path: str) -> Dict[str, Any]:
    """
    Extract text from PDF file path using LangChain's Blob and PyPDFParser.

    Args:
        pdf_path: Path to PDF file

    Returns:
        Dictionary with full_text, pages, and total_pages
    """
    try:
        # Create a Blob from file path
        blob = Blob.from_path(pdf_path)

        # Parse the PDF using PyPDFParser (page mode for individual pages)
        parser = PyPDFParser(mode="page")
        documents = list(parser.lazy_parse(blob))

        # Convert LangChain Documents to our page format
        pages_text: List[Dict[str, Any]] = []
        for doc in documents:
            page_num = doc.metadata.get("page", 0) + 1  # LangChain uses 0-indexed pages
            pages_text.append({
                "page_number": page_num,
                "text": doc.page_content,
            })

        full_text = "\n\n".join([p["text"] for p in pages_text])
        total_pages = len(pages_text)

        logger.info(f"Extracted text from PDF: {total_pages} pages")

        return {
            "full_text": full_text,
            "pages": pages_text,
            "total_pages": total_pages,
        }

    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise
