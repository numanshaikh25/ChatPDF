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
    <html lang="en" className={`${inter.variable} dark`}>
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
                background: 'hsl(224 50% 9%)',
                color: 'hsl(220 15% 92%)',
                border: '1px solid hsl(224 28% 18%)',
                boxShadow: '0 4px 24px -4px rgba(0,0,0,0.48)',
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
