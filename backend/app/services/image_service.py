import base64
import logging
import os
from typing import Dict, List

from app.config import settings
from app.services.minio_service import minio_service
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a helpful AI assistant that analyzes images and answers questions about them.

Instructions:
- Carefully examine the image and answer questions based on what you observe
- Be descriptive and thorough in your observations
- Reference specific visual elements (colors, shapes, text, objects, layout) when relevant
- If you cannot determine something from the image, say so clearly
- If the image contains text, read and interpret it accurately"""


class ImageService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            max_completion_tokens=settings.openai_max_tokens,
            api_key=settings.openai_api_key,
            temperature=1.0,
        )

    async def analyze_image(
        self,
        minio_key: str,
        query: str,
        chat_history: List[Dict] = None,
    ) -> str:
        ext_to_mime = {
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp",
        }

        try:
            image_bytes = minio_service.download_file_bytes(minio_key)
            base64_image = base64.b64encode(image_bytes).decode("utf-8")

            ext = os.path.splitext(minio_key)[1].lower()
            mime_type = ext_to_mime.get(ext, "image/png")

            messages = [SystemMessage(content=SYSTEM_PROMPT)]

            if chat_history:
                for msg in chat_history[-settings.max_chat_history:]:
                    if msg["role"] == "user":
                        messages.append(HumanMessage(content=msg["content"]))
                    elif msg["role"] == "assistant":
                        messages.append(AIMessage(content=msg["content"]))

            messages.append(
                HumanMessage(
                    content=[
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}",
                                "detail": "high",
                            },
                        },
                        {"type": "text", "text": query},
                    ]
                )
            )

            response = await self.llm.ainvoke(messages)
            content = response.content
            if isinstance(content, list):
                content = " ".join(
                    block.get("text", "") if isinstance(block, dict) else str(block)
                    for block in content
                )
            logger.info(f"Generated image analysis response (length: {len(content)})")
            return content

        except Exception as e:
            logger.error(f"Error analyzing image: {e}")
            raise


image_service = ImageService()
