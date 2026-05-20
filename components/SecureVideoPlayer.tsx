'use client'

import { useEffect, useRef } from 'react'

interface Props {
  videoUrl: string
  mimeType?: string
  onError?: () => void
  onReady?: () => void
}

export default function SecureVideoPlayer({ videoUrl, mimeType, onError, onReady }: Props) {
  const readyRef = useRef(false)
  const urlRef = useRef(videoUrl)

  useEffect(() => {
    readyRef.current = false
    urlRef.current = videoUrl
  }, [videoUrl])

  const isEmbed =
    videoUrl.startsWith('http') &&
    (videoUrl.includes('iframe.mediadelivery.net') ||
      videoUrl.includes('player.vimeo.com') ||
      videoUrl.includes('youtube.com') ||
      videoUrl.includes('youtu.be'))

  const isLocal = videoUrl.startsWith('/videos/')
  const mime = mimeType ?? (isLocal && videoUrl.includes('.mov') ? 'video/quicktime' : 'video/mp4')

  const fireReady = () => {
    if (readyRef.current || urlRef.current !== videoUrl) return
    readyRef.current = true
    onReady?.()
  }

  const fireError = () => {
    if (urlRef.current !== videoUrl) return
    onError?.()
  }

  return (
    <div className="relative select-none w-full">
      <div className="relative bg-black rounded-2xl overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
        {videoUrl && isLocal ? (
          <video
            controls
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-contain bg-black"
            onLoadedData={fireReady}
            onCanPlay={fireReady}
            onError={fireError}
          >
            <source src={videoUrl} type={mime} />
          </video>
        ) : videoUrl && isEmbed ? (
          <iframe
            src={videoUrl}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            onLoad={fireReady}
          />
        ) : videoUrl ? (
          <video
            src={videoUrl}
            controls
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-contain bg-black"
            onLoadedData={fireReady}
            onCanPlay={fireReady}
            onError={fireError}
          />
        ) : null}
      </div>
    </div>
  )
}
