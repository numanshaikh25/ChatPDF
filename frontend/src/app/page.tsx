'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, ImageIcon, MessageSquare, ArrowRight, Zap, Shield, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-60 -right-60 h-[600px] w-[600px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--gradient-brand)' }}
        />
        <div
          className="absolute top-1/2 -left-60 h-[500px] w-[500px] rounded-full opacity-[0.06] blur-3xl"
          style={{ background: 'var(--gradient-brand)' }}
        />
        <div
          className="absolute -bottom-60 right-1/3 h-[400px] w-[400px] rounded-full opacity-[0.07] blur-3xl"
          style={{ background: 'var(--gradient-brand)' }}
        />
      </div>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl shadow-md"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Onpdf</span>
        </div>

        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground border border-border hover:bg-muted transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--gradient-brand)' }}
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-24 text-center animate-slide-up">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm mb-8">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI-powered document & image analysis
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] sm:text-6xl">
          Chat with your{' '}
          <span className="text-gradient-brand">documents</span>{' '}
          &{' '}
          <span className="text-gradient-brand">images</span>
        </h1>

        <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Upload a PDF or an image and start asking questions instantly. Onpdf reads your files
          and gives you accurate, AI-powered answers — no copy-pasting required.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90"
            style={{ background: 'var(--gradient-brand)' }}
          >
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-foreground shadow-sm hover:bg-muted transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* ── Feature cards ───────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: 'var(--gradient-surface)' }}
            >
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold mb-2">Upload PDFs</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Drop any PDF — research papers, contracts, reports — and ask anything.
              Get precise answers extracted directly from the document.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: 'var(--gradient-surface)' }}
            >
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold mb-2">Analyze images</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload PNG or JPG files and let AI describe, summarize, and answer
              questions about what's in your images.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: 'var(--gradient-surface)' }}
            >
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-base font-semibold mb-2">Conversational AI</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ask follow-up questions naturally. Onpdf remembers the context of your
              document so every answer stays relevant.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why Onpdf ───────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <div
          className="rounded-3xl p-px"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <div className="rounded-[calc(1.5rem-1px)] bg-card px-8 py-10">
            <h2 className="text-2xl font-bold tracking-tight text-center mb-10">
              Why Onpdf?
            </h2>
            <div className="grid gap-8 sm:grid-cols-3 text-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
                  style={{ background: 'var(--gradient-surface)' }}
                >
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold">Instant answers</h4>
                <p className="text-sm text-muted-foreground">
                  No reading through pages. Ask and get the answer in seconds.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
                  style={{ background: 'var(--gradient-surface)' }}
                >
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold">Private & secure</h4>
                <p className="text-sm text-muted-foreground">
                  Your files are tied to your account only — never shared with others.
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm"
                  style={{ background: 'var(--gradient-surface)' }}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold">Multi-modal AI</h4>
                <p className="text-sm text-muted-foreground">
                  Works with both documents and images using the latest AI models.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────── */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight mb-4">
          Ready to get started?
        </h2>
        <p className="text-muted-foreground mb-8 text-base max-w-md mx-auto">
          Create your free account and upload your first document in under a minute.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90"
          style={{ background: 'var(--gradient-brand)' }}
        >
          Create free account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border px-6 py-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold">Onpdf</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Onpdf. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
