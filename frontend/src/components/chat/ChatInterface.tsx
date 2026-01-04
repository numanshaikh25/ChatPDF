'use client'

import { useEffect, useRef } from 'react'
import { Loader2, MessageSquare } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { useChatHistory, useSendMessage } from '@/hooks/useChat'
import { usePDFStatus } from '@/hooks/usePDF'
import toast from 'react-hot-toast'

interface ChatInterfaceProps {
  pdfId: string | null
}

export function ChatInterface({ pdfId }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: pdfStatus } = usePDFStatus(pdfId)
  const { data: chatHistory, isLoading: isLoadingHistory } = useChatHistory(pdfId)
  const sendMessageMutation = useSendMessage()

  const messages = chatHistory?.messages || []
  const isPdfReady = pdfStatus?.status === 'completed'

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (message: string) => {
    if (!pdfId || !isPdfReady) return

    try {
      await sendMessageMutation.mutateAsync({
        pdf_id: pdfId,
        message,
        chat_history: messages,
      })
    } catch (error: any) {
      toast.error(`Failed to send message: ${error.message}`)
    }
  }

  // No PDF selected
  if (!pdfId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No PDF Selected</p>
        <p className="text-sm mt-2">Upload a PDF or select one from the sidebar to start chatting</p>
      </div>
    )
  }

  // PDF not ready yet
  if (pdfStatus && !isPdfReady) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Loader2 className="h-16 w-16 mb-4 animate-spin" />
        <p className="text-lg font-medium">Processing PDF</p>
        <p className="text-sm mt-2">
          {pdfStatus.status === 'pending' && 'Waiting to start...'}
          {pdfStatus.status === 'uploaded' && 'Upload complete, starting processing...'}
          {pdfStatus.status === 'processing' && 'Extracting text and generating embeddings...'}
          {pdfStatus.status === 'failed' && 'Processing failed. Please try uploading again.'}
        </p>
        {pdfStatus.error_message && (
          <p className="text-sm text-red-500 mt-2">{pdfStatus.error_message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b p-4">
        <h2 className="font-semibold truncate">{pdfStatus?.filename}</h2>
        <p className="text-sm text-muted-foreground">
          {pdfStatus?.total_pages} pages • Ask me anything about this document
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
            <p className="font-medium">Start a Conversation</p>
            <p className="text-sm mt-1">Ask questions about your PDF document</p>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {sendMessageMutation.isPending && (
              <div className="flex gap-4 p-4 bg-muted/30">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Loader2 className="h-4 w-4 animate-spin text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <ChatInput
          onSend={handleSend}
          disabled={!isPdfReady}
          isLoading={sendMessageMutation.isPending}
        />
      </div>
    </div>
  )
}
