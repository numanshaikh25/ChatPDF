# ChatPDF Backend

PDF Chat Application Backend with FastAPI, LangChain, and PostgreSQL with pgvector.

## Features

- PDF upload and processing with LangChain document loaders
- Text extraction and chunking
- Vector embeddings with OpenAI
- Semantic search with pgvector
- Chat with PDF using GPT-5 models
- Background job processing with Inngest

## Tech Stack

- **FastAPI** - Modern Python web framework
- **LangChain** - LLM application framework
- **PostgreSQL + pgvector** - Vector database
- **MinIO** - S3-compatible object storage
- **Inngest** - Background job processing
- **UV** - Fast Python package manager

## Development

```bash
# Install dependencies
uv sync

# Run the application
uv run uvicorn app.main:app --reload
```
