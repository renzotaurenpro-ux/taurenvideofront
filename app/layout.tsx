import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import Providers from '@/components/Providers'
import AuthBar from '@/components/AuthBar'
import SeoJsonLd from '@/components/SeoJsonLd'
import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_THEME_COLOR,
  SITE_URL,
} from '@/lib/site-config'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const viewport: Viewport = {
  themeColor: SITE_THEME_COLOR,
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'SCAI',
    'scai regionales',
    'alergia',
    'inmunología',
    'certificado asistencia',
    'jornadas médicas',
    'formación médica',
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
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: '@scai.cl',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=scai', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon-16.png?v=scai', type: 'image/png', sizes: '16x16' },
      { url: '/icon.png?v=scai', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: [{ url: '/favicon.ico?v=scai' }],
    apple: [{ url: '/apple-icon.png?v=scai', type: 'image/png', sizes: '180x180' }],
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
    <html lang="es" suppressHydrationWarning className={cn('dark font-sans', inter.variable)}>
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground antialiased">
        <SeoJsonLd />
        <Providers>
          <AuthBar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
