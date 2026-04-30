import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import Providers from '@/components/Providers'
import AuthBar from '@/components/AuthBar'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'TaurenVideo | Conferencias Médicas',
  description: 'Plataforma exclusiva de streaming médico profesional',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={cn("dark font-sans", inter.variable)}>
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          <AuthBar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
