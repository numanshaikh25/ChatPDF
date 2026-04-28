'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, ImageIcon, X, Loader2 } from 'lucide-react'
import { useUploadImage } from '@/hooks/useImage'
import { formatBytes } from '@/lib/utils'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10 MB

export function ImageUploader({ onUploadComplete }: { onUploadComplete?: (imageId: string) => void }) {
  const [isUploading, setIsUploading] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  const uploadMutation = useUploadImage()

  const handleUpload = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true)
        setCurrentFile(file)

        const result = await uploadMutation.mutateAsync(file)

        toast.success('Image uploaded successfully!')
        setIsUploading(false)
        setCurrentFile(null)
        onUploadComplete?.(result.image_id.toString())
      } catch (error: any) {
        toast.error(`Upload failed: ${error?.response?.data?.detail || error.message}`)
        setIsUploading(false)
        setCurrentFile(null)
      }
    },
    [uploadMutation, onUploadComplete]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPEG, WEBP)')
        return
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(`File too large (max ${formatBytes(MAX_IMAGE_SIZE)})`)
        return
      }
      handleUpload(file)
    },
    [handleUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'] },
    maxFiles: 1,
    disabled: isUploading,
  })

  if (isUploading) {
    return (
      <div className="rounded-xl border border-border bg-accent/40 p-3.5 animate-slide-up">
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <ImageIcon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">{currentFile?.name}</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              {currentFile ? formatBytes(currentFile.size) : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Uploading…
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
        {isDragActive ? 'Drop to upload' : 'Upload an Image'}
      </p>
      <p className="text-[11px] text-muted-foreground">
        PNG, JPEG, WEBP · up to {formatBytes(MAX_IMAGE_SIZE)}
      </p>
    </div>
  )
}
