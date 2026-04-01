'use client'

import { FileText, Loader2, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { usePDFList, useDeletePDF, usePDFStatus } from '@/hooks/usePDF'
import { formatBytes, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { PDF } from '@/types/pdf'

interface PDFListProps {
  selectedPdfId: string | null
  onSelect: (pdfId: string) => void
}

function PDFListItem({
  pdf,
  isSelected,
  onSelect,
  onDelete,
}: {
  pdf: PDF
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}) {
  // Poll for status if PDF is processing
  const { data: statusData } = usePDFStatus(
    pdf.pdf_id,
    pdf.status === 'pending' || pdf.status === 'processing' || pdf.status === 'uploaded'
  )

  const currentPdf = statusData || pdf

  const statusConfig = {
    pending: { icon: Clock, color: 'text-yellow-500', label: 'Pending' },
    uploaded: { icon: Clock, color: 'text-blue-500', label: 'Uploaded' },
    processing: { icon: Loader2, color: 'text-blue-500', label: 'Processing', spin: true },
    completed: { icon: CheckCircle2, color: 'text-green-500', label: 'Ready' },
    failed: { icon: XCircle, color: 'text-red-500', label: 'Failed' },
  }

  const config = statusConfig[currentPdf.status as keyof typeof statusConfig]
  const StatusIcon = config?.icon || FileText

  return (
    <div
      onClick={onSelect}
      className={`
        mx-2 mb-1 rounded-xl px-3 py-3 cursor-pointer transition-all
        hover:bg-accent/70 group
        ${isSelected ? 'bg-accent ring-1 ring-primary/20 shadow-sm' : ''}
      `}
    >
      <div className="flex items-start gap-2.5">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${isSelected ? 'bg-primary/15' : 'bg-muted'}`}>
          <FileText className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate leading-tight">{currentPdf.filename}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <StatusIcon
              className={`h-3 w-3 ${config?.color} ${config?.spin ? 'animate-spin' : ''}`}
            />
            <span className="text-xs text-muted-foreground">{config?.label}</span>
            {currentPdf.total_pages && (
              <>
                <span className="text-xs text-muted-foreground/50">·</span>
                <span className="text-xs text-muted-foreground">{currentPdf.total_pages}p</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {formatBytes(currentPdf.file_size)} · {formatDate(currentPdf.created_at)}
          </p>
          {currentPdf.error_message && (
            <p className="text-xs text-destructive mt-1 truncate">{currentPdf.error_message}</p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export function PDFList({ selectedPdfId, onSelect }: PDFListProps) {
  const { data, isLoading } = usePDFList()
  const deleteMutation = useDeletePDF()

  const handleDelete = async (pdfId: string, filename: string) => {
    if (!confirm(`Delete "${filename}"? This will also delete all chat history.`)) {
      return
    }

    try {
      await deleteMutation.mutateAsync(pdfId)
      toast.success('PDF deleted')
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`)
    }
  }

  if (isLoading) {
    return (
      <div className="px-2 py-2 space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mx-0 rounded-xl px-3 py-3 bg-muted/40 animate-pulse">
            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-3/4" />
                <div className="h-2.5 bg-muted rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.pdfs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted mb-3">
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">No documents yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Upload a PDF to get started</p>
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
