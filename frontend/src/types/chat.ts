export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface RetrievedChunk {
  chunk_text: string
  page_number?: number
  similarity_score: number
}

export interface ChatQueryRequest {
  pdf_id: string
  message: string
  chat_history?: ChatMessage[]
}

export interface ChatQueryResponse {
  response: string
  retrieved_chunks?: RetrievedChunk[]
}

export interface ChatHistoryResponse {
  pdf_id: string
  messages: ChatMessage[]
  total: number
}
