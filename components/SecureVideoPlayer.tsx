'use client'

import { useEffect, useRef } from 'react'

interface Props {
  videoUrl: string
}

export default function SecureVideoPlayer({ videoUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const isVimeo = /vimeo\.com/i.test(videoUrl)

  useEffect(() => {
    const video = videoRef.current
    if (!videoUrl || isVimeo) return
    if (!video) return

    let cleanup: (() => void) | undefined

    if (videoUrl.includes('.m3u8')) {
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: false, maxBufferLength: 30 })
          hls.loadSource(videoUrl)
          hls.attachMedia(video)
          cleanup = () => hls.destroy()
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl
        }
      })
    } else {
      video.src = videoUrl
    }

    return () => cleanup?.()
  }, [videoUrl, isVimeo])

  return (
    <div className="relative select-none w-full">
      <div className="relative bg-black rounded-2xl overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
        {isVimeo ? (
          <iframe
            src={videoUrl}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            playsInline
          />
        )}
      </div>
    </div>
  )
}
