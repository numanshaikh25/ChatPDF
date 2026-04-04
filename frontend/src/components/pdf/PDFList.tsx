'use client'

import { FileText, Loader2, Trash2, CheckCircle2, XCircle, Clock, UploadCloud } from 'lucide-react'
import { usePDFList, useDeletePDF, usePDFStatus } from '@/hooks/usePDF'
import { formatBytes, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { PDF } from '@/types/pdf'

interface PDFListProps {
  selectedPdfId: string | null
  onSelect: (pdfId: string) => void
}

type StatusKey = 'pending' | 'uploaded' | 'processing' | 'completed' | 'failed'

const STATUS_CONFIG: Record<StatusKey, {
  icon: React.ElementType
  label: string
  spin?: boolean
  badge: string
}> = {
  pending:    { icon: Clock,         label: 'Pending',    badge: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/25' },
  uploaded:   { icon: UploadCloud,   label: 'Uploaded',   badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25' },
  processing: { icon: Loader2,       label: 'Processing', spin: true, badge: 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25' },
  completed:  { icon: CheckCircle2,  label: 'Ready',      badge: 'bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/25' },
  failed:     { icon: XCircle,       label: 'Failed',     badge: 'bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25' },
}

function PDFListItem({
  pdf, isSelected, onSelect, onDelete,
}: {
  pdf: PDF
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  const isInProgress =
    pdf.status === 'pending' || pdf.status === 'processing' || pdf.status === 'uploaded'

  const { data: statusData } = usePDFStatus(pdf.pdf_id, isInProgress)
  const current = statusData ?? pdf
  const config = STATUS_CONFIG[current.status as StatusKey] ?? STATUS_CONFIG.pending
  const StatusIcon = config.icon

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group mx-2 mb-0.5 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-150',
        'hover:bg-accent/60',
        isSelected
          ? 'bg-accent ring-1 ring-primary/25 shadow-sm'
          : ''
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* File icon */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 transition-all',
            isSelected ? 'shadow-sm' : 'bg-muted'
          )}
          style={isSelected ? { background: 'var(--gradient-brand)' } : undefined}
        >
          <FileText className={cn('h-4 w-4', isSelected ? 'text-white' : 'text-muted-foreground')} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold truncate leading-tight">{current.filename}</p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-tight">
            {formatBytes(current.file_size)}
            {current.total_pages != null && ` · ${current.total_pages}p`}
          </p>

          {/* Status badge */}
          <span
            className={cn(
              'inline-flex items-center gap-1 mt-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium border',
              config.badge
            )}
          >
            <StatusIcon className={cn('h-2.5 w-2.5', config.spin && 'animate-spin')} />
            {config.label}
          </span>

          {current.error_message && (
            <p className="text-[11px] text-destructive mt-1 truncate">{current.error_message}</p>
          )}
        </div>

        {/* Delete button */}
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

/* ── Skeleton ─────────────────────────────────────── */
function PDFSkeleton() {
  return (
    <div className="mx-2 mb-0.5 rounded-xl px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-lg skeleton shrink-0" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-2.5 rounded skeleton w-3/4" />
          <div className="h-2 rounded skeleton w-1/2" />
          <div className="h-4 rounded-full skeleton w-16" />
        </div>
      </div>
    </div>
  )
}

/* ── Main list ────────────────────────────────────── */
export function PDFList({ selectedPdfId, onSelect }: PDFListProps) {
  const { data, isLoading } = usePDFList()
  const deleteMutation = useDeletePDF()

  const handleDelete = async (pdfId: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?\n\nThis will also erase all chat history.`)) return
    try {
      await deleteMutation.mutateAsync(pdfId)
      toast.success('Document deleted')
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="py-1">
        {[1, 2, 3].map((i) => <PDFSkeleton key={i} />)}
      </div>
    )
  }

  if (!data || data.pdfs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted mb-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-xs font-semibold text-muted-foreground">No documents yet</p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">Upload a PDF above to get started</p>
      </div>
    )
  }

  return (
    <div className="py-1">
      {data.pdfs.map((pdf) => (
        <PDFListItem
          key={pdf.pdf_id}
          pdf={pdf}
          isSelected={selectedPdfId === pdf.pdf_id}
          onSelect={() => onSelect(pdf.pdf_id)}
          onDelete={() => handleDelete(pdf.pdf_id, pdf.filename)}
        />
      ))}
    </div>
  )
}
