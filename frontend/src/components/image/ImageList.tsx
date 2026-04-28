'use client'

import { ImageIcon, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { useImageList, useDeleteImage } from '@/hooks/useImage'
import { formatBytes } from '@/lib/utils'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { Image } from '@/types/image'

interface ImageListProps {
  selectedImageId: string | null
  onSelect: (imageId: string) => void
}

function ImageListItem({
  image,
  isSelected,
  onSelect,
  onDelete,
}: {
  image: Image
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const isReady = image.status === 'ready'
  const isFailed = image.status === 'failed'

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group mx-2 mb-0.5 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150',
        'hover:bg-accent/60',
        isSelected ? 'bg-accent ring-1 ring-primary/25 shadow-sm' : ''
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 transition-all',
            isSelected ? 'shadow-sm' : 'bg-muted'
          )}
          style={isSelected ? { background: 'var(--gradient-brand)' } : undefined}
        >
          <ImageIcon className={cn('h-4 w-4', isSelected ? 'text-white' : 'text-muted-foreground')} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate leading-tight">{image.filename}</p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-tight">
            {formatBytes(image.file_size)}
          </p>

          <span
            className={cn(
              'inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium border',
              isReady
                ? 'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25'
                : 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25'
            )}
          >
            {isReady ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : (
              <XCircle className="h-2.5 w-2.5" />
            )}
            {isReady ? 'Ready' : 'Failed'}
          </span>

          {image.error_message && (
            <p className="text-[11px] text-destructive mt-1 truncate">{image.error_message}</p>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md mt-0.5',
            'opacity-0 group-hover:opacity-100',
            'text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all'
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function ImageSkeleton() {
  return (
    <div className="mx-2 mb-0.5 rounded-xl px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-lg skeleton shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-2.5 rounded skeleton w-3/4" />
          <div className="h-2 rounded skeleton w-1/2" />
          <div className="h-4 rounded-full skeleton w-12" />
        </div>
      </div>
    </div>
  )
}

export function ImageList({ selectedImageId, onSelect }: ImageListProps) {
  const { data, isLoading } = useImageList()
  const deleteMutation = useDeleteImage()

  const handleDelete = async (imageId: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?\n\nThis will also erase all chat history.`)) return
    try {
      await deleteMutation.mutateAsync(imageId)
      toast.success('Image deleted')
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="py-1">
        {[1, 2].map((i) => <ImageSkeleton key={i} />)}
      </div>
    )
  }

  if (!data || data.images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted mb-3">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground">No images yet</p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">Upload an image above to get started</p>
      </div>
    )
  }

  return (
    <div className="py-1">
      {data.images.map((image) => (
        <ImageListItem
          key={image.image_id}
          image={image}
          isSelected={selectedImageId === image.image_id}
          onSelect={() => onSelect(image.image_id)}
          onDelete={() => handleDelete(image.image_id, image.filename)}
        />
      ))}
    </div>
  )
}
