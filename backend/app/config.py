import json
from typing import List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    app_name: str = "ChatPDF"
    environment: str = "development"
    debug: bool = True
    log_level: str = "INFO"

    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("["):
                return json.loads(v)
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v  # type: ignore[return-value]

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

    # JWT Auth
    secret_key: str = "dev-secret-key-please-change-in-production-use-32-chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 43200  # 30 days

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
