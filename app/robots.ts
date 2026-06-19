import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/ajustes',
          '/api/',
          '/ver',
          '/ver/',
          '/carrito',
          '/pagar',
          '/pago-exitoso',
          '/payment/',
          '/login',
          '/registro',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
