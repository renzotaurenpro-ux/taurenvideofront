import { ImageResponse } from 'next/og'
import {
  SITE_BACKGROUND_COLOR,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_THEME_COLOR,
  SITE_URL,
} from '@/lib/site-config'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = SITE_NAME

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
          padding: '72px 80px',
          background: `radial-gradient(circle at 20% 20%, rgba(18,180,198,0.22), transparent 42%), linear-gradient(135deg, ${SITE_BACKGROUND_COLOR} 0%, #061018 100%)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <svg width="88" height="88" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill={SITE_THEME_COLOR} />
            <circle cx="12" cy="12" r="8" stroke={SITE_THEME_COLOR} strokeWidth="2" />
            <path
              d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"
              stroke={SITE_THEME_COLOR}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div
            style={{
              color: '#ffffff',
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {SITE_NAME}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
          <div style={{ color: 'rgba(255,255,255,0.92)', fontSize: 34, lineHeight: 1.35 }}>
            {SITE_DESCRIPTION}
          </div>
          <div style={{ color: SITE_THEME_COLOR, fontSize: 24, letterSpacing: '0.12em' }}>
            {SITE_URL.replace('https://', '')}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
