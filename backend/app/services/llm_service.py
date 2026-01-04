import logging
from typing import Dict, List

from app.config import settings
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)


class LLMService:
    """Service for LLM interactions using LangChain"""

    def __init__(self):
        """Initialize ChatOpenAI model"""
        model_name = settings.openai_model.lower()

        self.llm = ChatOpenAI(
            model=settings.openai_model,
            max_completion_tokens=settings.openai_max_tokens,
            api_key=settings.openai_api_key,
            temperature=1.0,
        )

    def build_chat_messages(
        self,
        query: str,
        context_chunks: List[Dict],
        chat_history: List[Dict] = None,
    ) -> List:
        """
        Build chat messages with context and history

        Args:
            query: User's question
            context_chunks: Retrieved chunks for context
            chat_history: Previous chat messages

        Returns:
            List of messages for the LLM
        """
        messages = []

        # System message
        system_prompt = """You are a helpful AI assistant that answers questions based on the provided PDF document context.

Instructions:
- Answer questions using ONLY the information from the provided context
- If the context doesn't contain enough information to answer the question, say so
- Be concise but thorough in your answers
- Reference specific pages when relevant
- If asked about something not in the context, politely explain that you can only answer based on the provided document"""

        messages.append(SystemMessage(content=system_prompt))

        # Add chat history (limited)
        if chat_history:
            max_history = settings.max_chat_history
            recent_history = chat_history[-max_history:]

            for msg in recent_history:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))

        # Build context from chunks
        context_text = self._build_context(context_chunks)

        # User message with context and query
        user_message = f"""Context from the document:
{context_text}

Question: {query}"""

        messages.append(HumanMessage(content=user_message))

        return messages

    def _build_context(self, chunks: List[Dict]) -> str:
        """
        Build context string from retrieved chunks

        Args:
            chunks: List of chunk dicts

        Returns:
            Formatted context string
        """
        if not chunks:
            return "No relevant context found."

        context_parts = []
        for i, chunk in enumerate(chunks, 1):
            page_ref = f"[Page {chunk['page_number']}]" if chunk.get("page_number") else ""
            context_parts.append(f"{page_ref}\n{chunk['chunk_text']}")

        return "\n\n---\n\n".join(context_parts)

    async def generate_response(
        self,
        query: str,
        context_chunks: List[Dict],
        chat_history: List[Dict] = None,
    ) -> str:
        """
        Generate response using LLM

        Args:
            query: User's question
            context_chunks: Retrieved chunks for context
            chat_history: Previous chat messages

        Returns:
            Generated response
        """
        try:
            messages = self.build_chat_messages(query, context_chunks, chat_history)

            # Invoke LLM
            response = await self.llm.ainvoke(messages)

            logger.info(f"Generated response for query (length: {len(response.content)})")

            return response.content

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            raise

    async def generate_response_stream(
        self,
        query: str,
        context_chunks: List[Dict],
        chat_history: List[Dict] = None,
    ):
        """
        Generate streaming response using LLM

        Args:
            query: User's question
            context_chunks: Retrieved chunks for context
            chat_history: Previous chat messages

        Yields:
            Response chunks
        """
        try:
            messages = self.build_chat_messages(query, context_chunks, chat_history)

            # Stream response
            async for chunk in self.llm.astream(messages):
                if chunk.content:
                    yield chunk.content

        except Exception as e:
            logger.error(f"Error streaming response: {e}")
            raise


# Global LLM service instance
llm_service = LLMService()
