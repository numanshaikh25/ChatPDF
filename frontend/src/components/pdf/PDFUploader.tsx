'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, Loader2 } from 'lucide-react'
import { useInitUpload } from '@/hooks/usePDF'
import { uploadWithTusd } from '@/lib/tusd-uploader'
import { formatBytes } from '@/lib/utils'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
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

        toast.loading('Initializing upload…')
        const initResponse = await initUploadMutation.mutateAsync({
          filename: file.name,
          fileSize: file.size,
        })

        toast.dismiss()
        toast.success('Upload initialized')

        const upload = uploadWithTusd(file, initResponse.tusd_upload_url, initResponse.pdf_id, {
          onProgress: (bytesUploaded, bytesTotal) => {
            setUploadProgress(Math.round((bytesUploaded / bytesTotal) * 100))
          },
          onSuccess: () => {
            toast.success('Upload complete! Processing PDF…')
            setIsUploading(false)
            setCurrentFile(null)
            setUploadProgress(0)
            onUploadComplete?.(initResponse.pdf_id)
          },
          onError: (error) => {
            toast.error(`Upload failed: ${error.message}`)
            setIsUploading(false)
            setCurrentFile(null)
            setUploadProgress(0)
          },
        })

        setTusUpload(upload)
        upload.start()
      } catch (error: any) {
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
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File too large (max ${formatBytes(MAX_FILE_SIZE)})`)
        return
      }
      handleUpload(file)
    },
    [handleUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isUploading,
  })

  const handleCancel = () => {
    tusUpload?.abort()
    toast('Upload cancelled')
    setIsUploading(false)
    setCurrentFile(null)
    setUploadProgress(0)
    setTusUpload(null)
  }

  if (isUploading) {
    return (
      <div className="rounded-xl border border-border bg-accent/40 p-3.5 animate-slide-up">
        {/* File info row */}
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">{currentFile?.name}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {currentFile ? formatBytes(currentFile.size) : ''}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
            </span>
            <span className="font-semibold text-primary">{uploadProgress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${uploadProgress}%`,
                background: 'var(--gradient-brand)',
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 select-none',
        isDragActive
          ? 'border-primary bg-accent scale-[1.01] shadow-sm'
          : 'border-border hover:border-primary/50 hover:bg-accent/50'
      )}
    >
      <input {...getInputProps()} />
      <div
        className={cn(
          'mx-auto h-9 w-9 rounded-xl flex items-center justify-center mb-2.5 transition-transform',
          isDragActive ? 'scale-110' : 'bg-muted'
        )}
        style={isDragActive ? { background: 'var(--gradient-brand)' } : undefined}
      >
        <Upload className={cn('h-4 w-4', isDragActive ? 'text-white' : 'text-muted-foreground')} />
      </div>
      <p className="text-xs font-semibold mb-0.5">
        {isDragActive ? 'Drop to upload' : 'Upload a PDF'}
      </p>
      <p className="text-[11px] text-muted-foreground">
        Drag & drop or{' '}
        <span className="text-primary font-medium">browse files</span>
        {' '}· up to {formatBytes(MAX_FILE_SIZE)}
      </p>
    </div>
  )
}
