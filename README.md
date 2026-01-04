<img width="3024" height="1658" alt="image" src="https://github.com/user-attachments/assets/c57a9442-8017-4c2c-8dc7-a855a8880ee3" />


# ChatPDF - AI-Powered PDF Chat Application

A full-stack application that allows you to upload PDF documents and chat with them using AI. Built with Next.js, FastAPI, PostgreSQL with pgvector, and OpenAI's GPT-5-mini.

## Features

- 📄 **PDF Upload** - Resumable uploads with Tusd for large files
- 🤖 **AI Chat** - Ask questions about your PDFs using RAG (Retrieval Augmented Generation)
- 💾 **Chat History** - All conversations are saved and retrievable
- 📊 **Vector Search** - Efficient similarity search using pgvector
- 🔄 **Background Processing** - PDF processing handled by Inngest
- 🎨 **Modern UI** - ChatGPT-like interface built with Next.js and TailwindCSS

## Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **TanStack Query** - Server state management
- **Tus-js-client** - Resumable file uploads
- **React Markdown** - Message rendering

### Backend

- **FastAPI** - Python web framework
- **PostgreSQL + pgvector** - Database with vector search
- **SQLAlchemy** - ORM with async support
- **LangChain** - LLM orchestration
- **OpenAI API** - GPT-4o-mini and text-embedding-3-small
- **Pdfplumber** - PDF text extraction
- **Inngest** - Background job processing

### Infrastructure

- **MinIO** - S3-compatible object storage
- **Tusd** - Resumable upload server
- **Docker Compose** - Container orchestration
- **Alembic** - Database migrations

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Next.js   │────▶│   FastAPI   │────▶│ PostgreSQL   │
│  Frontend   │     │   Backend   │     │  + pgvector  │
└─────────────┘     └─────────────┘     └──────────────┘
       │                    │                    │
       │                    ▼                    │
       │            ┌──────────────┐             │
       │            │    Inngest   │             │
       │            │ (Background) │             │
       │            └──────────────┘             │
       │                    │                    │
       ▼                    ▼                    │
┌─────────────┐     ┌──────────────┐             │
│    Tusd     │────▶│    MinIO     │             │
│  (Uploads)  │     │  (Storage)   │             │
└─────────────┘     └──────────────┘             │
                           │                     │
                           └─────────────────────┘
```

## Prerequisites

- Docker and Docker Compose
- OpenAI API key
- Git

## Quick Start

1. **Clone the repository**

   ```bash
   cd /path/to/chatpdf
   ```

2. **Set up environment variables**

   ```bash
   # Create root .env file
   cp .env.example .env
   # Add your OpenAI API key
   echo "OPENAI_API_KEY=sk-your-key-here" > .env
   ```

3. **Start all services with Docker Compose**

   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs
   - **MinIO Console**: http://localhost:9001 (minioadmin / minioadmin123)
   - **Inngest Dashboard**: http://localhost:8288

## Development Setup

### Backend Development

```bash
cd backend

# Install dependencies with uv
uv sync

# Create .env file
cp .env.example .env
# Add your OpenAI API key

# Run database migrations
uv run alembic upgrade head

# Start FastAPI server
uv run uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Start Next.js dev server
npm run dev
```

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/chatpdf

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=pdfs

# Inngest
INNGEST_EVENT_KEY=local
INNGEST_SIGNING_KEY=local

# RAG Settings
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RETRIEVAL=5
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_TUSD_ENDPOINT=http://localhost:1080/files/
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
```

## How It Works

### 1. PDF Upload Flow

1. User uploads PDF via drag-and-drop
2. Frontend initializes upload with backend (`POST /api/v1/pdf/init-upload`)
3. Backend creates database record and returns Tusd upload URL
4. Frontend uploads file to Tusd with resumable upload support
5. Tusd stores file in MinIO and triggers webhook
6. Backend webhook handler triggers Inngest background job

### 2. PDF Processing (Background)

1. Inngest job downloads PDF from MinIO
2. Extracts text using pdfplumber
3. Splits text into chunks (1000 chars, 200 overlap)
4. Generates embeddings using OpenAI text-embedding-3-small
5. Stores chunks and embeddings in PostgreSQL with pgvector
6. Updates PDF status to 'completed'

### 3. Chat Flow (RAG)

1. User sends message
2. Backend generates query embedding
3. Vector similarity search in pgvector (cosine distance)
4. Retrieves top 5 most relevant chunks
5. Builds prompt with context, history, and query
6. Calls OpenAI GPT-4o-mini for response
7. Saves conversation to database
8. Returns response to frontend

## API Endpoints

### PDF Management

- `POST /api/v1/pdf/init-upload` - Initialize PDF upload
- `POST /api/v1/pdf/upload-complete` - Tusd webhook (internal)
- `GET /api/v1/pdf/list` - List all PDFs
- `GET /api/v1/pdf/{id}/status` - Get PDF processing status
- `DELETE /api/v1/pdf/{id}` - Delete PDF and data

### Chat

- `POST /api/v1/chat/query` - Send chat message
- `POST /api/v1/chat/stream` - Streaming chat (SSE)
- `GET /api/v1/chat/history/{pdf_id}` - Get chat history

### Health

- `GET /api/v1/health` - Health check
- `GET /api/v1/health/db` - Database health

## Database Schema

### pdfs

- `id` (UUID) - Primary key
- `filename` (VARCHAR) - Original filename
- `minio_key` (VARCHAR) - MinIO object key
- `file_size` (BIGINT) - File size in bytes
- `total_pages` (INTEGER) - Number of pages
- `status` (VARCHAR) - pending | uploaded | processing | completed | failed
- `error_message` (TEXT) - Error details if failed
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### pdf_chunks

- `id` (UUID) - Primary key
- `pdf_id` (UUID) - Foreign key to pdfs
- `chunk_text` (TEXT) - Text content
- `page_number` (INTEGER) - Source page
- `chunk_index` (INTEGER) - Chunk sequence
- `embedding` (VECTOR[1536]) - OpenAI embedding
- `created_at` (TIMESTAMP)

### chat_messages

- `id` (UUID) - Primary key
- `pdf_id` (UUID) - Foreign key to pdfs
- `role` (VARCHAR) - user | assistant
- `content` (TEXT) - Message content
- `retrieved_chunk_ids` (UUID[]) - Source chunks used
- `created_at` (TIMESTAMP)

## Troubleshooting

### PDF Processing Stuck

Check Inngest dashboard at http://localhost:8288 to see job status and errors.

### Upload Fails

- Check MinIO is running: http://localhost:9001
- Verify Tusd endpoint is accessible
- Check file size limits (default: 100MB)

### Vector Search Not Working

Ensure pgvector extension is installed:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Database Migration Issues

```bash
cd backend
uv run alembic revision --autogenerate -m "description"
uv run alembic upgrade head
```

## Performance Optimization

- **Chunk Size**: Adjust `CHUNK_SIZE` and `CHUNK_OVERLAP` for your use case
- **Top K**: Modify `TOP_K_RETRIEVAL` for more/fewer context chunks
- **Similarity Threshold**: Increase `SIMILARITY_THRESHOLD` for stricter matching
- **Batch Processing**: Embeddings are generated in batches of 2048

## Production Deployment

1. Set `MINIO_SECURE=true` and use HTTPS
2. Use production PostgreSQL (not Docker)
3. Set strong passwords for all services
4. Configure CORS properly for your domain
5. Use environment-specific API keys
6. Set up proper logging and monitoring
7. Use Next.js production build (`npm run build && npm start`)

## License

MIT
