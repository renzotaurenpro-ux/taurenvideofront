'use client'

import { useEffect, useRef } from 'react'
import { bunnyEmbedNoAutoplay } from '@/lib/bunny'

interface Props {
  videoUrl: string
  mimeType?: string
  onError?: () => void
  onReady?: () => void
}

export default function SecureVideoPlayer({ videoUrl, mimeType, onError, onReady }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isEmbed =
    videoUrl.startsWith('http') &&
    (videoUrl.includes('mediadelivery.net') || videoUrl.includes('youtu'))
  const embedSrc = isEmbed && videoUrl.includes('mediadelivery.net')
    ? bunnyEmbedNoAutoplay(videoUrl)
    : videoUrl

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.pause()
    el.autoplay = false
  }, [videoUrl])

  return (
    <div className="relative select-none w-full">
      <div className="relative bg-black rounded-2xl overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
        {videoUrl && isEmbed ? (
          <iframe
            key={embedSrc}
            src={embedSrc}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
            allowFullScreen
            onLoad={() => onReady?.()}
          />
        ) : videoUrl ? (
          <video
            ref={videoRef}
            key={videoUrl}
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-contain bg-black"
            onLoadedData={e => {
              e.currentTarget.pause()
              onReady?.()
            }}
            onError={() => onError?.()}
          >
            <source src={videoUrl} type={mimeType ?? 'video/mp4'} />
          </video>
        ) : null}
      </div>
    </div>
  )
}
