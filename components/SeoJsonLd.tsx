import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site-config'

export default function SeoJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    sameAs: ['https://www.scai.cl', 'https://instagram.com/scai.cl'],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
