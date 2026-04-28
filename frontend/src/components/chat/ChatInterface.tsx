'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Loader2, MessageSquare, Sparkles, FileText, ImageIcon,
  AlertCircle, ChevronDown, Zap,
} from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { useChatHistory, useSendMessage } from '@/hooks/useChat'
import { usePDFStatus } from '@/hooks/usePDF'
import { useImageChatHistory, useImageDetail, useSendImageMessage } from '@/hooks/useImage'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

export interface ActiveDocument {
  id: string
  type: 'pdf' | 'image'
}

interface ChatInterfaceProps {
  activeDoc: ActiveDocument | null
  sidebarOpen?: boolean
}

const SUGGESTION_PROMPTS = [
  'Summarize this document',
  'What are the key takeaways?',
  'List the main topics covered',
  'Explain the conclusion',
]

const IMAGE_SUGGESTION_PROMPTS = [
  'Describe what you see in this image',
  'What text is visible in this image?',
  'What are the main colors and elements?',
  'Analyze the content of this image',
]

const PROCESSING_STEPS: Record<string, { label: string; step: number }> = {
  pending:    { label: 'Queued for processing…',            step: 1 },
  uploaded:   { label: 'Upload complete — preparing…',      step: 2 },
  processing: { label: 'Extracting text & building index…', step: 3 },
  completed:  { label: 'Ready!',                            step: 4 },
  failed:     { label: 'Processing failed.',                step: 0 },
}

export function ChatInterface({ activeDoc, sidebarOpen }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const prevDocRef = useRef<ActiveDocument | null>(null)

  const isPdf = activeDoc?.type === 'pdf'
  const isImage = activeDoc?.type === 'image'
  const docId = activeDoc?.id ?? null

  // PDF hooks (enabled only for PDF docs)
  const { data: pdfStatus } = usePDFStatus(isPdf ? docId : null)
  const { data: pdfHistory, isLoading: isPdfHistoryLoading } = useChatHistory(isPdf ? docId : null)
  const pdfMutation = useSendMessage()

  // Image hooks (enabled only for image docs)
  const { data: imageDetail } = useImageDetail(isImage ? docId : null)
  const { data: imageHistory, isLoading: isImageHistoryLoading } = useImageChatHistory(isImage ? docId : null)
  const imageMutation = useSendImageMessage()

  // Unified state
  type Message = { role: 'user' | 'assistant'; content: string }
  const docStatus = isPdf ? pdfStatus : imageDetail
  const isReady = isPdf
    ? pdfStatus?.status === 'completed'
    : imageDetail?.status === 'ready'
  const isLoadingHistory = isPdf ? isPdfHistoryLoading : isImageHistoryLoading
  const messages: Message[] = isPdf
    ? (pdfHistory?.messages ?? [])
    : (imageHistory?.messages ?? [])
  const isMutationPending = isPdf ? pdfMutation.isPending : imageMutation.isPending

  const suggestions = isImage ? IMAGE_SUGGESTION_PROMPTS : SUGGESTION_PROMPTS

  // Cancel in-flight request when switching documents
  useEffect(() => {
    const prev = prevDocRef.current
    const docChanged = prev?.id !== activeDoc?.id || prev?.type !== activeDoc?.type
    if (prev !== null && docChanged) {
      if (pdfMutation.isPending) {
        pdfMutation.cancel()
        toast('Request cancelled — switched document', { icon: '⚡' })
      }
      if (imageMutation.isPending) {
        imageMutation.cancel()
      }
    }
    prevDocRef.current = activeDoc
  }, [activeDoc]) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleScroll = () => {
    const el = scrollContainerRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 120)
  }

  const handleSend = async (message: string) => {
    if (!docId || !isReady) return
    try {
      if (isPdf) {
        await pdfMutation.mutateAsync({
          pdf_id: docId,
          message,
          chat_history: messages as { role: 'user' | 'assistant'; content: string }[],
        })
      } else {
        await imageMutation.mutateAsync({
          image_id: docId,
          message,
          chat_history: messages as { role: 'user' | 'assistant'; content: string }[],
        })
      }
    } catch (error: any) {
      toast.error(`Failed to send message: ${error.response?.data?.detail || error.message}`)
    }
  }

  /* ── Empty / no document selected ─────────────────── */
  if (!activeDoc) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 px-8 animate-fade-in">
        <div className="relative">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-3xl shadow-lg"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <MessageSquare className="h-9 w-9 text-white" />
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border shadow-sm">
            <Zap className="h-3 w-3 text-primary" />
          </span>
        </div>

        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold mb-1">Chat with your documents</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Upload a PDF or image, then start asking questions about it.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {SUGGESTION_PROMPTS.map((hint) => (
            <span
              key={hint}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-accent text-accent-foreground border border-primary/15 cursor-default select-none hover:bg-accent/80 hover:border-primary/30 hover:scale-[1.03]"
            >
              {hint}
            </span>
          ))}
        </div>
      </div>
    )
  }

  /* ── PDF processing / error state ────────────────── */
  if (isPdf && pdfStatus && !isReady) {
    const isFailed = pdfStatus.status === 'failed'
    const info = PROCESSING_STEPS[pdfStatus.status] ?? PROCESSING_STEPS.pending
    const totalSteps = 3

    return (
      <div className="flex flex-col items-center justify-center h-full gap-5 px-8 animate-fade-in">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm',
            isFailed ? 'bg-destructive/10' : 'bg-primary/10'
          )}
        >
          {isFailed
            ? <AlertCircle className="h-8 w-8 text-destructive" />
            : <Loader2 className="h-8 w-8 text-primary animate-spin" />
          }
        </div>

        <div className="text-center">
          <p className="font-semibold text-base">
            {isFailed ? 'Processing Failed' : 'Processing Document'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{info.label}</p>
          {pdfStatus.error_message && (
            <p className="text-xs text-destructive mt-2 max-w-xs">{pdfStatus.error_message}</p>
          )}
        </div>

        {!isFailed && (
          <div className="w-56 space-y-1.5">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Step {info.step} of {totalSteps}</span>
              <span>{Math.round((info.step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(info.step / totalSteps) * 100}%`,
                  background: 'var(--gradient-brand)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ── Chat view ───────────────────────────────────── */
  const DocIcon = isImage ? ImageIcon : FileText

  return (
    <div className="relative flex flex-col h-full">

      {/* Chat header */}
      <div className={cn(
        'shrink-0 border-b px-5 py-3 flex items-center gap-3 glass animate-slide-up',
        !sidebarOpen && 'pl-14'
      )}>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <DocIcon className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-sm truncate leading-tight">{docStatus?.filename}</h2>
          <p className="text-xs text-muted-foreground leading-tight">
            {isPdf && (pdfStatus?.total_pages != null) ? `${pdfStatus.total_pages} pages · ` : ''}
            {isImage ? 'Image · Ask anything about this image' : 'Ask anything about this document'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isMutationPending ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
              <Loader2 className="h-3 w-3 animate-spin" />
              Thinking…
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-[hsl(var(--success))] border border-[hsl(var(--success)/0.2)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))] inline-block" />
              Ready
            </span>
          )}
        </div>
      </div>

      {/* Messages scroll area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8 animate-fade-in">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Start a Conversation</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isImage ? 'Ask any question about this image' : 'Ask any question about your document'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm mt-1">
              {suggestions.map((hint) => (
                <button
                  key={hint}
                  onClick={() => handleSend(hint)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-accent text-accent-foreground border border-primary/15 hover:bg-accent/80 hover:border-primary/30 hover:scale-[1.03] active:scale-[0.98]"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-3 space-y-1">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} index={index} />
            ))}

            {/* Typing indicator */}
            {isMutationPending && (
              <div className="flex gap-3 px-4 py-2 justify-start animate-slide-up">
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm mt-0.5"
                  style={{ background: 'var(--gradient-brand)' }}
                >
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center h-4">
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/50 inline-block" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/50 inline-block" />
                    <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/50 inline-block" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}
      </div>

      {/* Scroll-to-bottom FAB */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-24 right-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border shadow-md text-muted-foreground hover:text-foreground hover:shadow-lg animate-scale-in"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      )}

      {/* Input bar */}
      <div className="shrink-0 border-t px-4 pt-3 pb-4 glass">
        <ChatInput
          onSend={handleSend}
          disabled={!isReady}
          isLoading={isMutationPending}
          placeholder={
            isImage
              ? 'Ask anything about this image…'
              : undefined
          }
        />
        <p className="text-[11px] text-muted-foreground/50 text-center mt-2 select-none">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
