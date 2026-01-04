'use client'

import { FileText, Loader2, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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
        p-4 border-b cursor-pointer transition-colors hover:bg-accent/50
        ${isSelected ? 'bg-accent' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{currentPdf.filename}</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusIcon
                className={`h-4 w-4 ${config?.color} ${config?.spin ? 'animate-spin' : ''}`}
              />
              <span className="text-sm text-muted-foreground">{config?.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(currentPdf.file_size)} • {formatDate(currentPdf.created_at)}
            </p>
            {currentPdf.total_pages && (
              <p className="text-xs text-muted-foreground">{currentPdf.total_pages} pages</p>
            )}
            {currentPdf.error_message && (
              <p className="text-xs text-red-500 mt-1">{currentPdf.error_message}</p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
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
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data || data.pdfs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No PDFs uploaded yet</p>
        <p className="text-sm mt-1">Upload a PDF to get started</p>
      </div>
    )
  }

  return (
    <div className="divide-y">
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
