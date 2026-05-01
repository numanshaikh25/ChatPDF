'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FileText, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function SignupPage() {
  const router = useRouter()
  const { signup, isAuthenticated, isLoading } = useAuth()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '')
    setUsername(sanitized)
  }

  const usernameError =
    username.length > 0 && username.length < 3
      ? 'Username must be at least 3 characters'
      : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !username.trim() || !password) return
    if (usernameError) return
    setSubmitting(true)
    try {
      await signup({
        email: email.trim(),
        username: username.trim(),
        full_name: fullName.trim() || undefined,
        password,
      })
      router.push('/dashboard')
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string | { msg: string }[] } } })
        ?.response?.data?.detail
      const rawMsg =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail[0]?.msg ?? 'Signup failed'
          : 'Signup failed. Please try again.'
      const msg = rawMsg.startsWith('Value error, ') ? rawMsg.slice('Value error, '.length) : rawMsg
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: 'var(--gradient-brand)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full opacity-10 blur-3xl"
          style={{ background: 'var(--gradient-brand)' }}
        />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          {/* Brand */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ring-2 ring-white/20"
              style={{ background: 'var(--gradient-brand)' }}
            >
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight">Create account</h1>
              <p className="mt-1 text-sm text-muted-foreground">Join Onpdf today</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full name <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={handleUsernameChange}
                placeholder="janedoe"
                className={`w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 ${
                  usernameError
                    ? 'border-destructive focus:border-destructive focus:ring-destructive/20'
                    : 'border-input focus:border-primary focus:ring-primary/20'
                }`}
              />
              {usernameError ? (
                <p className="text-xs text-destructive">{usernameError}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Letters, numbers, underscores, and dashes only
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 pr-10 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
              style={{ background: 'var(--gradient-brand)' }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
