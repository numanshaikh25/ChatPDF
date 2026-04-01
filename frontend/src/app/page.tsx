'use client'

import { useState } from 'react'
import { FileText, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { PDFUploader } from '@/components/pdf/PDFUploader'
import { PDFList } from '@/components/pdf/PDFList'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { cn } from '@/lib/utils'

export default function Home() {
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleUploadComplete = (pdfId: string) => {
    setSelectedPdfId(pdfId)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={cn(
          'flex flex-col bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] transition-all duration-300 ease-in-out shrink-0 overflow-hidden',
          sidebarOpen ? 'w-72' : 'w-0'
        )}
      >
        {/* Brand header */}
        <div className="px-4 py-4 border-b border-[hsl(var(--sidebar-border))] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl shadow-sm"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight leading-none">ChatPDF</h1>
                <p className="text-[10px] text-muted-foreground mt-0.5">AI document assistant</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Upload section */}
        <div className="px-3 pt-3 pb-2 shrink-0 border-b border-[hsl(var(--sidebar-border))]">
          <PDFUploader onUploadComplete={handleUploadComplete} />
        </div>

        {/* Documents header */}
        <div className="px-4 pt-3 pb-1 shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Documents
          </p>
        </div>

        {/* PDF list — scrollable */}
        <div className="flex-1 overflow-y-auto pb-3">
          <PDFList
            selectedPdfId={selectedPdfId}
            onSelect={setSelectedPdfId}
          />
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Collapsed sidebar toggle */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent animate-fade-in"
            title="Open sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        <ChatInterface pdfId={selectedPdfId} sidebarOpen={sidebarOpen} />
      </main>
    </div>
  )
}
