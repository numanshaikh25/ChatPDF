import base64
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


def parse_tusd_metadata(metadata_header: Optional[str]) -> Dict[str, str]:
    """
    Parse Tusd Upload-Metadata header (base64 encoded key-value pairs)

    Format: "key1 base64value1,key2 base64value2"

    Args:
        metadata_header: Upload-Metadata header value

    Returns:
        Dictionary of metadata key-value pairs
    """
    if not metadata_header:
        return {}

    metadata = {}
    try:
        pairs = metadata_header.split(",")
        for pair in pairs:
            pair = pair.strip()
            if " " in pair:
                key, encoded_value = pair.split(" ", 1)
                # Decode base64 value
                decoded_value = base64.b64decode(encoded_value).decode("utf-8")
                metadata[key] = decoded_value
    except Exception as e:
        logger.error(f"Error parsing Tusd metadata: {e}")

    return metadata


def encode_tusd_metadata(metadata: Dict[str, str]) -> str:
    """
    Encode metadata for Tusd Upload-Metadata header

    Args:
        metadata: Dictionary of key-value pairs

    Returns:
        Encoded metadata string
    """
    pairs = []
    for key, value in metadata.items():
        encoded_value = base64.b64encode(value.encode("utf-8")).decode("utf-8")
        pairs.append(f"{key} {encoded_value}")

    return ",".join(pairs)
