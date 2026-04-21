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
import type {
  AuthToken,
  ChangePasswordRequest,
  LoginRequest,
  SignupRequest,
  UpdateProfileRequest,
  User,
} from '@/types/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Create axios instance
export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request if available
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
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
  query: async (request: ChatQueryRequest, signal?: AbortSignal): Promise<ChatQueryResponse> => {
    const { data } = await apiClient.post('/chat/query', request, { signal })
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

// Auth API
export const authApi = {
  login: async (request: LoginRequest): Promise<AuthToken> => {
    const { data } = await apiClient.post('/auth/login', request)
    return data
  },

  signup: async (request: SignupRequest): Promise<AuthToken> => {
    const { data } = await apiClient.post('/auth/register', request)
    return data
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me')
    return data
  },

  updateProfile: async (request: UpdateProfileRequest): Promise<User> => {
    const { data } = await apiClient.put('/auth/profile', request)
    return data
  },

  changePassword: async (request: ChangePasswordRequest): Promise<void> => {
    await apiClient.put('/auth/password', request)
  },
}
