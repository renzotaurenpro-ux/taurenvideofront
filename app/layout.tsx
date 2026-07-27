import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import Providers from '@/components/Providers'
import AuthBar from '@/components/AuthBar'
import SeoJsonLd from '@/components/SeoJsonLd'
import {
  SITE_DESCRIPTION,
  SITE_EVENT_NAME,
  SITE_LOCALE,
  SITE_NAME,
  SITE_THEME_COLOR,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site-config'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: false,
})

const ICON_V = 'scai3'

export const viewport: Viewport = {
  themeColor: SITE_THEME_COLOR,
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_EVENT_NAME,
  keywords: [
    'SCAI',
    'scai regionales',
    'III Jornadas Regionales',
    'inmunología clínica',
    'errores innatos de la inmunidad',
    'alergia',
    'inmunología',
    'certificado asistencia',
    'CONACEM',
    'Sociedad Chilena de Alergia e Inmunología',
  ],
  authors: [{ name: 'SCAI', url: 'https://www.scai.cl' }],
  creator: 'SCAI',
  publisher: 'SCAI',
  category: 'health',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      'es-CL': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: SITE_EVENT_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: '@scai.cl',
  },
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ICON_V}`, sizes: '48x48', type: 'image/x-icon' },
      { url: `/icon-16.png?v=${ICON_V}`, type: 'image/png', sizes: '16x16' },
      { url: `/icon.png?v=${ICON_V}`, type: 'image/png', sizes: '32x32' },
      { url: `/icon-192.png?v=${ICON_V}`, type: 'image/png', sizes: '192x192' },
    ],
    shortcut: [{ url: `/favicon.ico?v=${ICON_V}` }],
    apple: [{ url: `/apple-icon.png?v=${ICON_V}`, type: 'image/png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={cn('dark font-sans', inter.variable, inter.className)}>
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <SeoJsonLd />
        <Providers>
          <AuthBar />
          <div className="flex-1 flex flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  )
}
