'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Loader2, LogOut, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react'
import { PDFUploader } from '@/components/pdf/PDFUploader'
import { PDFList } from '@/components/pdf/PDFList'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

export default function Home() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [selectedPdfId, setSelectedPdfId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const handleUploadComplete = (pdfId: string) => {
    setSelectedPdfId(pdfId)
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={cn(
          'flex flex-col bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] transition-all duration-300 ease-in-out shrink-0 overflow-hidden',
          sidebarOpen ? 'w-72' : 'w-0'
        )}
      >
        {/* Brand header */}
        <div className="px-4 py-4 border-b border-[hsl(var(--sidebar-border))] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl shadow-sm"
                style={{ background: 'var(--gradient-brand)' }}
              >
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight leading-none">Onpdf</h1>
                <p className="text-[10px] text-muted-foreground mt-0.5">AI document assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Upload section */}
        <div className="px-3 pt-3 pb-2 shrink-0 border-b border-[hsl(var(--sidebar-border))]">
          <PDFUploader onUploadComplete={handleUploadComplete} />
        </div>

        {/* Documents header */}
        <div className="px-4 pt-3 pb-1 shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Documents
          </p>
        </div>

        {/* PDF list — scrollable */}
        <div className="flex-1 overflow-y-auto pb-3">
          <PDFList
            selectedPdfId={selectedPdfId}
            onSelect={setSelectedPdfId}
          />
        </div>

        {/* ── User footer ── */}
        <div className="shrink-0 border-t border-[hsl(var(--sidebar-border))] px-3 py-3">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
              />
            ) : (
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ background: 'var(--gradient-brand)' }}
              >
                {initials}
              </div>
            )}
            {/* Name */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold leading-none">
                {user?.full_name || user?.username}
              </p>
              <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                @{user?.username}
              </p>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-0.5">
              <Link
                href="/settings"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Collapsed sidebar toggle */}
        {!sidebarOpen && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 animate-fade-in">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Open sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}

        <ChatInterface pdfId={selectedPdfId} sidebarOpen={sidebarOpen} />
      </main>
    </div>
  )
}
