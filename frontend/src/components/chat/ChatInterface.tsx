'use client'

import { useEffect, useRef } from 'react'
import { Loader2, MessageSquare, Sparkles, FileText, AlertCircle } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">No document selected</p>
          <p className="text-sm text-muted-foreground mt-1">Upload a PDF or select one from the sidebar to start chatting</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {['Summarize this document', 'What are the key points?', 'Find specific information'].map((hint) => (
            <span key={hint} className="px-3 py-1.5 rounded-full text-xs bg-muted text-muted-foreground border border-border">
              {hint}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // PDF not ready yet
  if (pdfStatus && !isPdfReady) {
    const isFailed = pdfStatus.status === 'failed'
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-8">
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${isFailed ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          {isFailed
            ? <AlertCircle className="h-8 w-8 text-destructive" />
            : <Loader2 className="h-8 w-8 text-primary animate-spin" />
          }
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">{isFailed ? 'Processing Failed' : 'Processing Document'}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {pdfStatus.status === 'pending' && 'Waiting to start…'}
            {pdfStatus.status === 'uploaded' && 'Upload complete, starting processing…'}
            {pdfStatus.status === 'processing' && 'Extracting text and generating embeddings…'}
            {pdfStatus.status === 'failed' && 'Please try uploading again.'}
          </p>
          {pdfStatus.error_message && (
            <p className="text-sm text-destructive mt-2">{pdfStatus.error_message}</p>
          )}
        </div>
        {!isFailed && (
          <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b px-5 py-3 flex items-center gap-3 bg-card/60 backdrop-blur-sm">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="font-semibold text-sm truncate leading-tight">{pdfStatus?.filename}</h2>
          <p className="text-xs text-muted-foreground leading-tight">
            {pdfStatus?.total_pages} pages · Ask anything about this document
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Start a Conversation</p>
              <p className="text-sm text-muted-foreground mt-1">Ask any question about your document</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {sendMessageMutation.isPending && (
              <div className="flex gap-3 px-4 py-3 justify-start">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                  <div className="flex gap-1 items-center h-5">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-card/40">
        <ChatInput
          onSend={handleSend}
          disabled={!isPdfReady}
          isLoading={sendMessageMutation.isPending}
        />
        <p className="text-xs text-muted-foreground/60 text-center mt-2">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
