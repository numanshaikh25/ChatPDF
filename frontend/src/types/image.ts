export interface Image {
  image_id: string
  filename: string
  status: 'ready' | 'failed'
  file_size: number
  created_at: string
  updated_at: string
  error_message?: string
}

export interface ImageListResponse {
  images: Image[]
  total: number
}

export interface DeleteImageResponse {
  message: string
  image_id: string
}

export interface ImageChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ImageChatRequest {
  image_id: string
  message: string
  chat_history?: ImageChatMessage[]
}

export interface ImageChatResponse {
  response: string
}

export interface ImageChatHistoryResponse {
  image_id: string
  messages: ImageChatMessage[]
  total: number
}
