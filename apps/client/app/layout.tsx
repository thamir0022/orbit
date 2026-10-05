import type { Metadata } from 'next'

import { Geist, Geist_Mono } from 'next/font/google'

import './global.css'

import { cn } from '@/shared/lib/utils'

import { ThemeProvider } from '@/shared/ui/theme-provider'

import { Toaster } from '@/shared/ui/sonner'

import { TooltipProvider } from '@/shared/ui/tooltip'

import { GlobalSessionProvider } from '@/widgets/global-session/ui/global-session-provider'

import { QueryProvider } from './providers/query.provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Orbit',
  description: 'A modern project management platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className="h-dvh w-full overflow-hidden"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'h-dvh w-full overflow-hidden'
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider>
              <GlobalSessionProvider>
                <div className="box-border flex h-full w-full min-h-0 min-w-0 overflow-hidden p-1">
                  {children}
                </div>
              </GlobalSessionProvider>
            </TooltipProvider>
          </QueryProvider>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
