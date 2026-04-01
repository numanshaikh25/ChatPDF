'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { PDFUploader } from '@/components/pdf/PDFUploader'
import { PDFList } from '@/components/pdf/PDFList'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function Home() {
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null)

  const handleUploadComplete = (pdfId: string) => {
    // Automatically select the newly uploaded PDF
    setSelectedPdfId(pdfId)
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col bg-card shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b bg-gradient-to-br from-primary/10 to-accent">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">ChatPDF</h1>
          </div>
          <p className="text-xs text-muted-foreground pl-10">Chat with your documents</p>
        </div>

        {/* Upload Section */}
        <div className="p-4 border-b">
          <PDFUploader onUploadComplete={handleUploadComplete} />
        </div>

        {/* PDF List Header */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Documents</p>
        </div>

        {/* PDF List */}
        <div className="flex-1 overflow-y-auto">
          <PDFList
            selectedPdfId={selectedPdfId}
            onSelect={setSelectedPdfId}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatInterface pdfId={selectedPdfId} />
      </div>
    </div>
  )
}
