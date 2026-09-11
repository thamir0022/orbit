import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './global.css'
import { ThemeProvider } from '@/shared/ui/theme-provider'
import { cn } from '@/shared/lib/utils'
import { Toaster } from '@/shared/ui/sonner'
import { QueryProvider } from './providers/query.provider'
import { TooltipProvider } from '@/shared/ui/tooltip'
import { GlobalSessionProvider } from '@/widgets/global-session/ui/global-session-provider'

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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={cn(geistMono.variable, geistSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <TooltipProvider>
              <GlobalSessionProvider>
                <div className="w-[calc(100dvw-5px)] h-[calc(100dvh-10px)] m-1 p-1 rounded-lg border">
                  <main className="size-full flex flex-col">{children}</main>
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
