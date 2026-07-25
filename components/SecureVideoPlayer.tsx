'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { bunnyEmbedUrl } from '@/lib/bunny'
import { PLACEHOLDER_VIDEO_FALLBACKS } from '@/lib/placeholderVideo'

interface Props {
  videoUrl: string
  mimeType?: string
  poster?: string
  onError?: () => void
  onReady?: () => void
}

function isBunnyEmbed(url: string) {
  return url.startsWith('http') && url.includes('mediadelivery.net')
}

function isYoutubeEmbed(url: string) {
  return url.startsWith('http') && url.includes('youtu')
}

export default function SecureVideoPlayer({ videoUrl, mimeType, poster, onError, onReady }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [src, setSrc] = useState(videoUrl)
  const [fallbackIdx, setFallbackIdx] = useState(0)
  const [started, setStarted] = useState(!poster)

  const isEmbed = isBunnyEmbed(videoUrl) || isYoutubeEmbed(videoUrl)
  const embedSrc = isBunnyEmbed(videoUrl) ? bunnyEmbedUrl(videoUrl, started) : videoUrl

  useEffect(() => {
    setSrc(videoUrl)
    setFallbackIdx(0)
    setStarted(!poster)
  }, [videoUrl, poster])

  useEffect(() => {
    if (poster) onReady?.()
  }, [videoUrl, poster])

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

  function startPlayback() {
    setStarted(true)
    if (!isEmbed) {
      requestAnimationFrame(() => {
        void videoRef.current?.play().catch(() => {})
      })
    }
  }

  return (
    <div className="relative select-none w-full">
      <div className="relative bg-black rounded-2xl overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
        {videoUrl && isEmbed ? (
          !started && poster ? (
            <button
              type="button"
              onClick={startPlayback}
              className="absolute inset-0 z-10 group"
              aria-label="Reproducir"
            >
              <Image src={poster} alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" priority />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-white/80 bg-black/45 flex items-center justify-center backdrop-blur-sm group-hover:scale-105 transition-transform">
                  <Play size={28} className="text-white fill-white ml-1" />
                </span>
              </span>
            </button>
          ) : (
            <iframe
              key={embedSrc}
              src={embedSrc}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; autoplay"
              allowFullScreen
              onLoad={() => onReady?.()}
            />
          )
        ) : src ? (
          <>
            <video
              ref={videoRef}
              key={src}
              src={src}
              controls={started}
              playsInline
              preload="metadata"
              poster={poster}
              className="absolute inset-0 h-full w-full object-contain bg-black"
              onLoadedData={e => {
                if (!started) e.currentTarget.pause()
                onReady?.()
              }}
              onPlay={() => setStarted(true)}
              onError={handleVideoError}
            >
              <source src={src} type={mimeType ?? 'video/mp4'} />
            </video>
            {!started && poster && (
              <button
                type="button"
                onClick={startPlayback}
                className="absolute inset-0 z-10 group"
                aria-label="Reproducir"
              >
                <Image src={poster} alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-2 border-white/80 bg-black/45 flex items-center justify-center backdrop-blur-sm">
                    <Play size={28} className="text-white fill-white ml-1" />
                  </span>
                </span>
              </button>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
