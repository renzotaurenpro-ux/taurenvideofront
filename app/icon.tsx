import { ImageResponse } from 'next/og'
import { SITE_BACKGROUND_COLOR, SITE_THEME_COLOR } from '@/lib/site-config'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: SITE_BACKGROUND_COLOR,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill={SITE_THEME_COLOR} />
          <circle cx="12" cy="12" r="8" stroke={SITE_THEME_COLOR} strokeWidth="2" />
          <path
            d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"
            stroke={SITE_THEME_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
