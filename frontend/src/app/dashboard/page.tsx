'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, ImageIcon, Loader2, LogOut, PanelLeftClose, PanelLeftOpen, Settings } from 'lucide-react'
import { PDFUploader } from '@/components/pdf/PDFUploader'
import { PDFList } from '@/components/pdf/PDFList'
import { ImageUploader } from '@/components/image/ImageUploader'
import { ImageList } from '@/components/image/ImageList'
import { ChatInterface, type ActiveDocument } from '@/components/chat/ChatInterface'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

type SidebarTab = 'documents' | 'images'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [activeDoc, setActiveDoc] = useState<ActiveDocument | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('documents')

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const handlePdfUploadComplete = (pdfId: string) => {
    setActiveDoc({ id: pdfId, type: 'pdf' })
  }

  const handleImageUploadComplete = (imageId: string) => {
    setActiveDoc({ id: imageId, type: 'image' })
  }

  const handleLogout = () => {
    logout()
    router.push('/')
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

        {/* Tab bar */}
        <div className="px-3 pt-3 pb-2 shrink-0">
          <div className="flex rounded-lg bg-muted p-0.5 gap-0.5">
            <button
              onClick={() => setSidebarTab('documents')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-semibold transition-all',
                sidebarTab === 'documents'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="h-3 w-3" />
              Documents
            </button>
            <button
              onClick={() => setSidebarTab('images')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-semibold transition-all',
                sidebarTab === 'images'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ImageIcon className="h-3 w-3" />
              Images
            </button>
          </div>
        </div>

        {sidebarTab === 'documents' ? (
          <>
            <div className="px-3 pb-2 shrink-0 border-b border-[hsl(var(--sidebar-border))]">
              <PDFUploader onUploadComplete={handlePdfUploadComplete} />
            </div>
            <div className="px-4 pt-3 pb-1 shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Documents
              </p>
            </div>
            <div className="flex-1 overflow-y-auto pb-3">
              <PDFList
                selectedPdfId={activeDoc?.type === 'pdf' ? activeDoc.id : null}
                onSelect={(pdfId) => setActiveDoc({ id: pdfId, type: 'pdf' })}
              />
            </div>
          </>
        ) : (
          <>
            <div className="px-3 pb-2 shrink-0 border-b border-[hsl(var(--sidebar-border))]">
              <ImageUploader onUploadComplete={handleImageUploadComplete} />
            </div>
            <div className="px-4 pt-3 pb-1 shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                Images
              </p>
            </div>
            <div className="flex-1 overflow-y-auto pb-3">
              <ImageList
                selectedImageId={activeDoc?.type === 'image' ? activeDoc.id : null}
                onSelect={(imageId) => setActiveDoc({ id: imageId, type: 'image' })}
              />
            </div>
          </>
        )}

        {/* ── User footer ── */}
        <div className="shrink-0 border-t border-[hsl(var(--sidebar-border))] px-3 py-3">
          <div className="flex items-center gap-2.5">
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
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold leading-none">
                {user?.full_name || user?.username}
              </p>
              <p className="truncate text-[10px] text-muted-foreground mt-0.5">
                @{user?.username}
              </p>
            </div>
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
        <ChatInterface activeDoc={activeDoc} sidebarOpen={sidebarOpen} />
      </main>
    </div>
  )
}
