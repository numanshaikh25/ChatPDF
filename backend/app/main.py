import logging
from contextlib import asynccontextmanager

import inngest.fast_api
from app.api.v1.router import api_router
from app.config import settings
from app.inngest.client import inngest_client
from app.inngest.functions.pdf_processing import process_pdf
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(f"Starting {settings.app_name}...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.debug}")

    # TODO: Initialize database connection
    # TODO: Initialize MinIO client
    # TODO: Initialize Inngest client

    yield

    # Shutdown
    logger.info("Shutting down...")
    # TODO: Close database connections
    # TODO: Close other connections


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="PDF Chat Application with RAG",
    version="0.1.0",
    lifespan=lifespan,
    debug=settings.debug,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Serve Inngest functions
inngest.fast_api.serve(app, inngest_client, [process_pdf])


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": f"Welcome to {settings.app_name} API", "version": "0.1.0", "docs": "/docs"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "app": settings.app_name, "environment": settings.environment}
