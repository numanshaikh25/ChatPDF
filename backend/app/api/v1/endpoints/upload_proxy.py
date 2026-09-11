"""
Proxy endpoint for Tusd uploads
This allows the frontend to upload through the same origin to avoid CORS issues
"""

import logging
from typing import Optional

import httpx
from app.config import settings
from fastapi import APIRouter, Header, HTTPException, Request, Response

logger = logging.getLogger(__name__)

router = APIRouter()

TUSD_INTERNAL_ENDPOINT = settings.tusd_endpoint.rstrip("/")


@router.api_route(
    "/files/{path:path}", methods=["GET", "POST", "PATCH", "HEAD", "OPTIONS", "DELETE"]
)
async def proxy_tusd(
    path: str,
    request: Request,
    tus_resumable: Optional[str] = Header(None),
    upload_offset: Optional[str] = Header(None),
    upload_length: Optional[str] = Header(None),
    upload_metadata: Optional[str] = Header(None),
    content_type: Optional[str] = Header(None),
):
    """
    Proxy all Tusd requests to the internal Tusd server
    This allows the frontend to upload through the API endpoint
    """
    try:
        # Build the target URL
        target_url = f"{TUSD_INTERNAL_ENDPOINT}/{path}" if path else f"{TUSD_INTERNAL_ENDPOINT}/"

        # Get the request body
        body = await request.body()

        # Prepare headers to forward
        headers = {}
        if tus_resumable:
            headers["Tus-Resumable"] = tus_resumable
        if upload_offset:
            headers["Upload-Offset"] = upload_offset
        if upload_length:
            headers["Upload-Length"] = upload_length
        if upload_metadata:
            headers["Upload-Metadata"] = upload_metadata
        if content_type:
            headers["Content-Type"] = content_type

        # Add any other Tus-specific headers from the request
        for key, value in request.headers.items():
            if key.lower().startswith("tus-") or key.lower() == "upload-concat":
                headers[key] = value

        logger.info(f"Proxying {request.method} request to Tusd: {target_url}")

        # Make the request to Tusd
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                follow_redirects=False,
            )

        # Prepare response headers
        response_headers = {}
        for key, value in response.headers.items():
            # Forward Tus-specific headers
            if key.lower() in [
                "tus-resumable",
                "tus-version",
                "tus-extension",
                "tus-max-size",
                "upload-offset",
                "upload-length",
                "upload-metadata",
                "location",
                "upload-expires",
            ]:
                response_headers[key] = value

        # Return the response
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=response_headers,
        )

    except httpx.RequestError as e:
        logger.error(f"Error proxying to Tusd: {e}")
        raise HTTPException(status_code=502, detail=f"Failed to proxy upload request: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in upload proxy: {e}")
        raise HTTPException(status_code=500, detail=f"Upload proxy error: {str(e)}")
