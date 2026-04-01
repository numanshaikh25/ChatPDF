'use client'

import { User, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex gap-3 px-4 py-3 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mt-0.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-sm'
            : 'bg-card border border-border rounded-tl-sm shadow-sm'
        }`}
      >
        <div
          className={`prose prose-sm max-w-none ${
            isUser
              ? 'prose-invert text-primary-foreground [&_p]:text-primary-foreground [&_li]:text-primary-foreground [&_strong]:text-primary-foreground'
              : 'text-foreground'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap m-0 leading-relaxed">{message.content}</p>
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary mt-0.5">
          <User className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
    </div>
  )
}
