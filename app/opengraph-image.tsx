import { ImageResponse } from 'next/og'
import {
  SITE_BACKGROUND_COLOR,
  SITE_DESCRIPTION,
  SITE_EVENT_NAME,
  SITE_THEME_COLOR,
  SITE_URL,
} from '@/lib/site-config'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = SITE_EVENT_NAME

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: `radial-gradient(circle at 18% 18%, rgba(18,180,198,0.28), transparent 40%), linear-gradient(135deg, ${SITE_BACKGROUND_COLOR} 0%, #061018 100%)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: SITE_THEME_COLOR,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          SCAI · scai regionales
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 980 }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: 58,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {SITE_EVENT_NAME}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.88)', fontSize: 30, lineHeight: 1.35 }}>
            {SITE_DESCRIPTION}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ color: SITE_THEME_COLOR, fontSize: 24, letterSpacing: '0.08em' }}>
            {SITE_URL.replace('https://', '')}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 22 }}>
            $30.000 · CONACEM
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
