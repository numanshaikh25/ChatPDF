'use client'

import { useState } from 'react'
import { User, Sparkles, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
  index?: number
}

export function ChatMessage({ message, index = 0 }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 py-2',
        isUser ? 'justify-end animate-slide-in-right' : 'justify-start animate-slide-in-left'
      )}
      style={{ animationDelay: `${Math.min(index * 30, 200)}ms` }}
    >
      {/* AI avatar */}
      {!isUser && (
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm mt-1"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {/* Bubble */}
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
            isUser
              ? 'rounded-tr-sm text-primary-foreground'
              : 'bg-card border border-border rounded-tl-sm text-foreground'
          )}
          style={isUser ? { background: 'var(--gradient-brand)' } : undefined}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap m-0 leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose-chat text-sm">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button — appears on hover */}
        <div
          className={cn(
            'flex opacity-0 group-hover:opacity-100 transition-opacity',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            {copied
              ? <><Check className="h-3 w-3 text-[hsl(var(--success))]" /> Copied</>
              : <><Copy className="h-3 w-3" /> Copy</>
            }
          </button>
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30 mt-1">
          <User className="h-3.5 w-3.5 text-primary" />
        </div>
      )}
    </div>
  )
}
