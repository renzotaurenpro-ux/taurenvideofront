import { ImageResponse } from 'next/og'
import { SITE_BACKGROUND_COLOR, SITE_NAME, SITE_THEME_COLOR } from '@/lib/site-config'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: SITE_BACKGROUND_COLOR,
          gap: 14,
        }}
      >
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
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
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'lowercase',
          }}
        >
          {SITE_NAME}
        </div>
      </div>
    ),
    { ...size }
  )
}
