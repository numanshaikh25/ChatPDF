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
            relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragActive
                ? 'border-primary bg-primary/8 scale-[1.01]'
                : 'border-border hover:border-primary/60 hover:bg-accent/60'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className={`mx-auto h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Upload className="h-4 w-4" />
          </div>
          <p className="text-sm font-medium mb-0.5">
            {isDragActive ? 'Drop your PDF here' : 'Upload a PDF'}
          </p>
          <p className="text-xs text-muted-foreground">
            Drag & drop or <span className="text-primary font-medium">browse</span> · Max {formatBytes(MAX_FILE_SIZE)}
          </p>
        </div>
      ) : (
        <div className="border rounded-xl p-4 bg-muted/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">{currentFile?.name}</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {currentFile && formatBytes(currentFile.size)}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Uploading…</span>
              <span className="font-semibold text-primary">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
