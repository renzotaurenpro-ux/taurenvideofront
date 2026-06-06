'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { bunnyEmbedNoAutoplay } from '@/lib/bunny'
import { PLACEHOLDER_VIDEO_FALLBACKS } from '@/lib/placeholderVideo'

interface Props {
  videoUrl: string
  mimeType?: string
  onError?: () => void
  onReady?: () => void
}

function isBunnyEmbed(url: string) {
  return url.startsWith('http') && url.includes('mediadelivery.net')
}

function isYoutubeEmbed(url: string) {
  return url.startsWith('http') && url.includes('youtu')
}

export default function SecureVideoPlayer({ videoUrl, mimeType, onError, onReady }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState(videoUrl)
  const [fallbackIdx, setFallbackIdx] = useState(0)

  const isEmbed = isBunnyEmbed(videoUrl) || isYoutubeEmbed(videoUrl)
  const embedSrc = isBunnyEmbed(videoUrl) ? bunnyEmbedNoAutoplay(videoUrl) : videoUrl

  useEffect(() => {
    setSrc(videoUrl)
    setFallbackIdx(0)
  }, [videoUrl])

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.pause()
    el.autoplay = false
  }, [src])

  const handleVideoError = useCallback(() => {
    const next = PLACEHOLDER_VIDEO_FALLBACKS[fallbackIdx]
    if (next) {
      setFallbackIdx(i => i + 1)
      setSrc(next)
      return
    }
    onError?.()
  }, [fallbackIdx, onError])

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
        ) : src ? (
          <video
            ref={videoRef}
            key={src}
            src={src}
            controls
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-contain bg-black"
            onLoadedData={e => {
              e.currentTarget.pause()
              onReady?.()
            }}
            onError={handleVideoError}
          >
            <source src={src} type={mimeType ?? 'video/mp4'} />
          </video>
        ) : null}
      </div>
    </div>
  )
}
