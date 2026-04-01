'use client'

import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  isLoading?: boolean
}

export function ChatInput({ onSend, disabled, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  useEffect(() => {
    adjustHeight()
  }, [message])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!message.trim() || disabled || isLoading) return
    onSend(message.trim())
    setMessage('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const isDisabled = disabled || isLoading
  const canSend = !!message.trim() && !isDisabled

  return (
    <form onSubmit={handleSubmit} className="relative flex items-end gap-2 rounded-xl border border-border bg-card shadow-sm px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isDisabled && !isLoading ? 'Select a ready PDF to start chatting…' : 'Ask a question about your PDF… (Enter to send, Shift+Enter for new line)'}
        disabled={isDisabled}
        rows={1}
        className={cn(
          'flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50',
          'max-h-40 py-1'
        )}
      />
      <button
        type="submit"
        disabled={!canSend}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
          canSend
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
      </button>
    </form>
  )
}
