import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/lib/query-client'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { AuthProvider } from '@/contexts/AuthContext'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Onpdf — Chat with your documents',
  description: 'Upload PDFs and chat with them using AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme on initial load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(s===null&&d)){document.documentElement.classList.add('dark');}}catch(e){}})()`,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster
                position="top-right"
                gutter={8}
                toastOptions={{
                  duration: 3500,
                  style: {
                    borderRadius: '0.75rem',
                    background: 'hsl(var(--card))',
                    color: 'hsl(var(--card-foreground))',
                    border: '1px solid hsl(var(--border))',
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
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
