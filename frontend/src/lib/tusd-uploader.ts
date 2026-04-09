import * as tus from 'tus-js-client'

export interface UploadCallbacks {
  onProgress?: (bytesUploaded: number, bytesTotal: number) => void
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function uploadWithTusd(
  file: File,
  uploadUrl: string,
  pdfId: string,
  callbacks: UploadCallbacks = {}
): tus.Upload {
  const upload = new tus.Upload(file, {
    endpoint: uploadUrl,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    chunkSize: 5 * 1024 * 1024, // 5MB chunks
    metadata: {
      pdf_id: pdfId,
      filename: file.name,
      filetype: file.type,
    },
    onError: (error) => {
      console.error('Upload failed:', error)
      callbacks.onError?.(error)
    },
    onProgress: (bytesUploaded, bytesTotal) => {
      callbacks.onProgress?.(bytesUploaded, bytesTotal)
    },
    onSuccess: () => {
      console.log('Upload completed successfully')
      callbacks.onSuccess?.()
    },
  })

  return upload
}
