from minio import Minio
from minio.error import S3Error
import logging
from typing import Optional
import io

from app.config import settings

logger = logging.getLogger(__name__)


class MinIOService:
    """MinIO client wrapper for file storage operations"""

    def __init__(self):
        """Initialize MinIO client"""
        self.client = Minio(
            settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=settings.minio_secure,
        )
        self.bucket = settings.minio_bucket
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist"""
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                logger.info(f"Created MinIO bucket: {self.bucket}")
            else:
                logger.info(f"MinIO bucket already exists: {self.bucket}")
        except S3Error as e:
            logger.error(f"Error ensuring bucket exists: {e}")
            raise

    def download_file(self, object_name: str, file_path: str) -> None:
        """
        Download file from MinIO to local path

        Args:
            object_name: Object key in MinIO (e.g., "pdfs/abc-123.pdf")
            file_path: Local file path to save to
        """
        try:
            self.client.fget_object(self.bucket, object_name, file_path)
            logger.info(f"Downloaded {object_name} to {file_path}")
        except S3Error as e:
            logger.error(f"Error downloading file {object_name}: {e}")
            raise

    def download_file_bytes(self, object_name: str) -> bytes:
        """
        Download file from MinIO as bytes

        Args:
            object_name: Object key in MinIO

        Returns:
            File contents as bytes
        """
        try:
            response = self.client.get_object(self.bucket, object_name)
            data = response.read()
            response.close()
            response.release_conn()
            logger.info(f"Downloaded {object_name} as bytes")
            return data
        except S3Error as e:
            logger.error(f"Error downloading file bytes {object_name}: {e}")
            raise

    def upload_file(self, object_name: str, file_path: str) -> None:
        """
        Upload file to MinIO from local path

        Args:
            object_name: Object key in MinIO
            file_path: Local file path to upload
        """
        try:
            self.client.fput_object(self.bucket, object_name, file_path)
            logger.info(f"Uploaded {file_path} to {object_name}")
        except S3Error as e:
            logger.error(f"Error uploading file {object_name}: {e}")
            raise

    def upload_bytes(self, object_name: str, data: bytes, content_type: str = "application/pdf") -> None:
        """
        Upload bytes to MinIO

        Args:
            object_name: Object key in MinIO
            data: File data as bytes
            content_type: MIME type of the file
        """
        try:
            self.client.put_object(
                self.bucket,
                object_name,
                io.BytesIO(data),
                length=len(data),
                content_type=content_type,
            )
            logger.info(f"Uploaded bytes to {object_name}")
        except S3Error as e:
            logger.error(f"Error uploading bytes to {object_name}: {e}")
            raise

    def delete_file(self, object_name: str) -> None:
        """
        Delete file from MinIO

        Args:
            object_name: Object key in MinIO
        """
        try:
            self.client.remove_object(self.bucket, object_name)
            logger.info(f"Deleted {object_name}")
        except S3Error as e:
            logger.error(f"Error deleting file {object_name}: {e}")
            raise

    def file_exists(self, object_name: str) -> bool:
        """
        Check if file exists in MinIO

        Args:
            object_name: Object key in MinIO

        Returns:
            True if file exists, False otherwise
        """
        try:
            self.client.stat_object(self.bucket, object_name)
            return True
        except S3Error:
            return False

    def get_file_url(self, object_name: str, expires: int = 3600) -> str:
        """
        Get presigned URL for file download

        Args:
            object_name: Object key in MinIO
            expires: URL expiration time in seconds (default: 1 hour)

        Returns:
            Presigned URL string
        """
        try:
            url = self.client.presigned_get_object(self.bucket, object_name, expires=expires)
            logger.info(f"Generated presigned URL for {object_name}")
            return url
        except S3Error as e:
            logger.error(f"Error generating presigned URL for {object_name}: {e}")
            raise

    def get_file_info(self, object_name: str) -> Optional[dict]:
        """
        Get file metadata

        Args:
            object_name: Object key in MinIO

        Returns:
            Dictionary with file metadata or None if not found
        """
        try:
            stat = self.client.stat_object(self.bucket, object_name)
            return {
                "size": stat.size,
                "last_modified": stat.last_modified,
                "content_type": stat.content_type,
                "etag": stat.etag,
            }
        except S3Error as e:
            logger.error(f"Error getting file info for {object_name}: {e}")
            return None


# Global MinIO service instance
minio_service = MinIOService()
