import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from '@/lib/context/auth-context'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: 'Business AI Workflow Orchestrator',
  description: 'Enterprise AI-powered document workflow management console with intelligent processing, approval routing, and audit compliance.',
}

export const viewport: Viewport = {
  themeColor: '#1a2744',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
