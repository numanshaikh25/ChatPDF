'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // Always redirect to dashboard - auth middleware will handle login redirect
    if (!isLoading) {
      router.replace('/dashboard')
    }
  }, [isLoading, router])

  // Show nothing while redirecting
  return null
}
