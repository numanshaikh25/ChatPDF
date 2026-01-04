from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    app_name: str = "ChatPDF"
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"

    # Database
    database_url: str
    db_pool_size: int = 10

    # OpenAI
    openai_api_key: str
    openai_model: str = "gpt-5-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_temperature: float = 1.0
    openai_max_tokens: int = 1000

    # Inngest (keys are optional for dev server)
    inngest_event_key: Optional[str] = None
    inngest_signing_key: Optional[str] = None
    inngest_api_base_url: str = "http://inngest:8288"
    inngest_event_api_base_url: str = "http://inngest:8288"

    # MinIO
    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_bucket: str = "pdfs"
    minio_secure: bool = False

    # Tusd
    tusd_endpoint: str  # Internal Docker URL for webhooks
    tusd_public_endpoint: str  # Public URL for browser uploads
    max_file_size: int = 104857600  # 100MB

    # RAG Settings
    chunk_size: int = 1000
    chunk_overlap: int = 200
    top_k_retrieval: int = 5
    similarity_threshold: float = 0.7
    max_chat_history: int = 5

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=False, extra="ignore"
    )


# Global settings instance
settings = Settings()
