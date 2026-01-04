'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useInitUpload } from '@/hooks/usePDF'
import { uploadWithTusd } from '@/lib/tusd-uploader'
import { formatBytes } from '@/lib/utils'
import toast from 'react-hot-toast'
import type * as tus from 'tus-js-client'

const MAX_FILE_SIZE = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '104857600')

export function PDFUploader({ onUploadComplete }: { onUploadComplete?: (pdfId: string) => void }) {
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [tusUpload, setTusUpload] = useState<tus.Upload | null>(null)

  const initUploadMutation = useInitUpload()

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true)
        setCurrentFile(file)
        setUploadProgress(0)

        // Step 1: Initialize upload on backend
        toast.loading('Initializing upload...')
        const initResponse = await initUploadMutation.mutateAsync({
          filename: file.name,
          fileSize: file.size,
        })

        toast.dismiss()
        toast.success('Upload initialized')

        // Step 2: Upload to Tusd
        const upload = uploadWithTusd(file, initResponse.tusd_upload_url, initResponse.pdf_id, {
          onProgress: (bytesUploaded, bytesTotal) => {
            const percent = Math.round((bytesUploaded / bytesTotal) * 100)
            setUploadProgress(percent)
          },
          onSuccess: () => {
            toast.success('Upload completed! Processing PDF...')
            setIsUploading(false)
            setCurrentFile(null)
            setUploadProgress(0)
            onUploadComplete?.(initResponse.pdf_id)
          },
          onError: (error) => {
            console.error('Upload error:', error)
            toast.error(`Upload failed: ${error.message}`)
            setIsUploading(false)
            setCurrentFile(null)
            setUploadProgress(0)
          },
        })

        setTusUpload(upload)
        upload.start()
      } catch (error: any) {
        console.error('Upload initialization error:', error)
        toast.error(`Failed to initialize upload: ${error.message}`)
        setIsUploading(false)
        setCurrentFile(null)
      }
    },
    [initUploadMutation, onUploadComplete]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File size exceeds ${formatBytes(MAX_FILE_SIZE)}`)
        return
      }

      handleUpload(file)
    },
    [handleUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  const handleCancel = () => {
    if (tusUpload) {
      tusUpload.abort()
      toast('Upload cancelled')
    }
    setIsUploading(false)
    setCurrentFile(null)
    setUploadProgress(0)
    setTusUpload(null)
  }

  return (
    <div className="w-full">
      {!isUploading ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">
            {isDragActive ? 'Drop PDF here' : 'Drag & drop PDF file here'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
          <Button type="button" variant="outline" size="sm">
            Select PDF
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Maximum file size: {formatBytes(MAX_FILE_SIZE)}
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              <FileText className="h-8 w-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{currentFile?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentFile && formatBytes(currentFile.size)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
