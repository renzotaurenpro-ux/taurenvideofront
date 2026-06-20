import type { MetadataRoute } from 'next'
import {
  SITE_BACKGROUND_COLOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_THEME_COLOR,
  SITE_URL,
} from '@/lib/site-config'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'SCAI',
    description: SITE_DESCRIPTION,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: SITE_BACKGROUND_COLOR,
    theme_color: SITE_THEME_COLOR,
    lang: 'es',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-16.png?v=scai',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/icon.png?v=scai',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png?v=scai',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/icon-192.png?v=scai',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png?v=scai',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    id: SITE_URL,
  }
}
