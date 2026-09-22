'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, MessageSquare, Upload, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useAuth()

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isLoading, isAuthenticated, router])

  // Show landing page for unauthenticated users
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ring-2 ring-white/20"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight font-serif text-gradient-brand">
              Dokument
            </h1>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <MessageSquare className="h-4 w-4" />
            AI-powered document chat
          </div>
          <h2 className="mb-6 text-5xl font-bold tracking-tighter font-serif text-foreground leading-tight">
            Chat with your documents
          </h2>
          <p className="mb-8 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Upload PDFs and images, then ask questions. Get instant answers with context from your documents.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary-hover shadow-md hover:shadow-lg transition-all"
            >
              Start chatting
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-medium text-foreground bg-card hover:bg-muted border border-border shadow-sm transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-20 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 px-4 animate-slide-up">
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Upload documents</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Drop in PDFs and images. We&apos;ll extract and index the content automatically.
            </p>
          </div>
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">Ask questions</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Chat naturally with your documents. Get precise answers grounded in your content.
            </p>
          </div>
          <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-2 font-semibold text-foreground">See context</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every answer shows the source. Jump to the exact page or section instantly.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm py-6">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs text-muted-foreground">
            © 2026 Dokument. Chat with your documents using AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
