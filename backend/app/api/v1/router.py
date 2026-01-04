from fastapi import APIRouter

from app.api.v1.endpoints import health, pdf, chat

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(pdf.router, prefix="/pdf", tags=["pdf"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
