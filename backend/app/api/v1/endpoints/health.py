from fastapi import APIRouter
from app.config import settings

router = APIRouter()


@router.get("")
async def health_check():
    """
    General health check endpoint
    """
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": "0.1.0",
        "environment": settings.environment
    }


@router.get("/db")
async def database_health():
    """
    Database health check
    TODO: Implement actual database connection check
    """
    return {
        "status": "healthy",
        "database": "postgresql",
        "message": "Database connection OK"
    }
