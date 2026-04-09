import axios from 'axios'
import type {
  InitUploadResponse,
  PDFListResponse,
  PDF
} from '@/types/pdf'
import type {
  ChatQueryRequest,
  ChatQueryResponse,
  ChatHistoryResponse
} from '@/types/chat'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// PDF API
export const pdfApi = {
  initUpload: async (filename: string, fileSize: number): Promise<InitUploadResponse> => {
    const { data } = await apiClient.post('/pdf/init-upload', {
      filename,
      file_size: fileSize,
    })
    return data
  },

  list: async (): Promise<PDFListResponse> => {
    const { data } = await apiClient.get('/pdf/list')
    return data
  },

  getStatus: async (pdfId: string): Promise<PDF> => {
    const { data } = await apiClient.get(`/pdf/${pdfId}/status`)
    return data
  },

  delete: async (pdfId: string): Promise<void> => {
    await apiClient.delete(`/pdf/${pdfId}`)
  },
}

// Chat API
export const chatApi = {
  query: async (request: ChatQueryRequest): Promise<ChatQueryResponse> => {
    const { data } = await apiClient.post('/chat/query', request)
    return data
  },

  getHistory: async (pdfId: string): Promise<ChatHistoryResponse> => {
    const { data } = await apiClient.get(`/chat/history/${pdfId}`)
    return data
  },
}

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string }> => {
    const { data } = await apiClient.get('/health')
    return data
  },
}
