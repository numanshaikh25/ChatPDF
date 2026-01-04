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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">ChatPDF</h1>
          </div>
          <p className="text-sm text-muted-foreground">Chat with your documents</p>
        </div>

        {/* Upload Section */}
        <div className="p-4 border-b">
          <PDFUploader onUploadComplete={handleUploadComplete} />
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
      <div className="flex-1 flex flex-col">
        <ChatInterface pdfId={selectedPdfId} />
      </div>
    </div>
  )
}
