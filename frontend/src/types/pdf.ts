export interface PDF {
  pdf_id: string
  filename: string
  status: 'pending' | 'uploaded' | 'processing' | 'completed' | 'failed'
  file_size: number
  total_pages?: number
  created_at: string
  updated_at: string
  error_message?: string
}

export interface InitUploadResponse {
  pdf_id: string
  tusd_upload_url: string
  message: string
}

export interface PDFListResponse {
  pdfs: PDF[]
  total: number
}
