import {
  SITE_DESCRIPTION,
  SITE_EVENT_NAME,
  SITE_EVENT_SUBTITLE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site-config'
import { PRICE_CLP } from '@/lib/pricing'

export default function SeoJsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sociedad Chilena de Alergia e Inmunología',
    alternateName: ['SCAI', SITE_NAME],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    sameAs: ['https://www.scai.cl', 'https://instagram.com/scai.cl'],
    logo: `${SITE_URL}/icon-512.png`,
  }

  const course = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: SITE_EVENT_NAME,
    alternateName: SITE_TITLE,
    description: `${SITE_EVENT_SUBTITLE}. ${SITE_DESCRIPTION}`,
    provider: {
      '@type': 'Organization',
      name: 'Sociedad Chilena de Alergia e Inmunología',
      sameAs: 'https://www.scai.cl',
    },
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    isAccessibleForFree: false,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/carrito`,
      price: PRICE_CLP,
      priceCurrency: 'CLP',
      availability: 'https://schema.org/InStock',
      category: 'Paid',
      description: `$${PRICE_CLP.toLocaleString('es-CL')}`,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      name: SITE_EVENT_NAME,
      courseMode: 'online',
      startDate: '2026-06-19',
      location: {
        '@type': 'VirtualLocation',
        url: SITE_URL,
      },
    },
  }

  const event = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: SITE_EVENT_NAME,
    description: SITE_EVENT_SUBTITLE,
    startDate: '2026-06-19',
    eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'VirtualLocation',
      url: SITE_URL,
    },
    organizer: {
      '@type': 'Organization',
      name: 'Sociedad Chilena de Alergia e Inmunología',
      url: 'https://www.scai.cl',
    },
    image: [`${SITE_URL}/opengraph-image`],
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/carrito`,
      price: PRICE_CLP,
      priceCurrency: 'CLP',
      availability: 'https://schema.org/InStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(course) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
      />
    </>
  )
}
