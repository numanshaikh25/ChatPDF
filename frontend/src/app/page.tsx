'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, MessageSquare, ArrowRight, Sparkles, Check } from 'lucide-react'
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
    <div className="min-h-screen bg-white">
      {/* ── Navbar ──────────────────────────────────────────── */}
      <header className="relative z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 shadow-sm">
              <FileText className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Dokument</span>
          </div>

          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 shadow-sm transition-all"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative px-8 pt-24 pb-32">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-100 px-4 py-2 text-sm font-medium text-purple-700 mb-8">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            AI-powered document intelligence
          </div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-8">
            Your documents,
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-violet-700 bg-clip-text text-transparent">
              intelligently answered
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-12">
            Upload PDFs and images, then chat naturally to extract insights instantly.
            No searching, no scrolling—just ask and receive accurate, contextual answers.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 shadow-lg hover:shadow-xl transition-all"
            >
              Start for free
              <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Sign in
            </Link>
          </div>

          {/* Visual mockup placeholder */}
          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200 bg-white/50">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                <div className="h-3 w-3 rounded-full bg-green-400"></div>
              </div>
              <div className="p-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 shadow-lg">
                    <MessageSquare className="h-10 w-10 text-white" strokeWidth={2} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-900">Chat interface</p>
                    <p className="text-gray-600">Upload your first document to begin</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="relative px-8 py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A powerful, intuitive platform designed to make document interaction effortless.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-50 text-purple-600 mb-6">
                <FileText className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">PDF intelligence</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload research papers, contracts, reports, or any PDF. Ask questions and receive precise, cited answers instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-violet-50 text-violet-600 mb-6">
                <MessageSquare className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Natural conversation</h3>
              <p className="text-gray-600 leading-relaxed">
                Chat naturally with your documents. The AI remembers context and provides relevant follow-up responses effortlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-50 text-purple-600 mb-6">
                <Sparkles className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-modal AI</h3>
              <p className="text-gray-600 leading-relaxed">
                Works seamlessly with both documents and images. Extract insights from charts, diagrams, and visual content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ────────────────────────────────────────── */}
      <section className="relative px-8 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-6">
                Save hours of manual reading
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Stop skimming through endless pages. Get the exact information you need in seconds with AI that truly understands your documents.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                    <Check className="h-4 w-4 text-purple-600" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Instant answers</p>
                    <p className="text-gray-600">Ask questions and get precise responses in seconds</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                    <Check className="h-4 w-4 text-purple-600" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Private & secure</p>
                    <p className="text-gray-600">Your documents stay private, never shared or exposed</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                    <Check className="h-4 w-4 text-purple-600" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Context awareness</p>
                    <p className="text-gray-600">Follow-up questions maintain conversation context</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 border border-gray-200 shadow-lg">
              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-500 mb-2">You asked</p>
                  <p className="text-gray-900 font-medium">What are the key findings in section 3?</p>
                </div>
                <div className="bg-gradient-to-r from-purple-600 to-violet-700 rounded-xl p-6 shadow-sm text-white">
                  <p className="text-sm font-medium text-purple-100 mb-2">AI response</p>
                  <p className="font-medium">Section 3 identifies three primary factors affecting outcomes...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────── */}
      <section className="relative px-8 py-24 bg-gradient-to-br from-purple-600 to-violet-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to transform how you work?
          </h2>
          <p className="text-xl text-purple-50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join professionals using Dokument to unlock insights from their documents instantly.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-purple-600 bg-white hover:bg-gray-50 shadow-xl hover:shadow-2xl transition-all"
          >
            Create your free account
            <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="relative px-8 py-12 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-violet-700 shadow-sm">
              <FileText className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-gray-900">Dokument</span>
          </div>
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Dokument. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
