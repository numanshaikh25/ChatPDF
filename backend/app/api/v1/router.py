from fastapi import APIRouter

from app.api.v1.endpoints import auth, chat, health, image, pdf, upload_proxy

# Create main API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(pdf.router, prefix="/pdf", tags=["pdf"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(image.router, prefix="/image", tags=["image"])
api_router.include_router(upload_proxy.router, prefix="/upload", tags=["upload"])
