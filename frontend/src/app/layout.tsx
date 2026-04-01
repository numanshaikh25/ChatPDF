import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/lib/query-client'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ChatPDF — Chat with your documents',
  description: 'Upload PDFs and chat with them using AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '0.75rem',
                background: 'hsl(0 0% 100%)',
                color: 'hsl(224 71% 8%)',
                border: '1px solid hsl(218 28% 88%)',
                boxShadow: '0 4px 24px -4px rgba(0,0,0,0.12)',
                fontSize: '0.8125rem',
                fontWeight: '500',
                padding: '10px 14px',
              },
              success: {
                iconTheme: { primary: 'hsl(142 72% 40%)', secondary: 'white' },
              },
              error: {
                iconTheme: { primary: 'hsl(0 82% 60%)', secondary: 'white' },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}
