'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  videoUrl: string
  userEmail: string
}

export default function SecureVideoPlayer({ videoUrl, userEmail }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [devToolsOpen, setDevToolsOpen] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

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
  }, [videoUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const sync = () => {
      canvas.width = video.offsetWidth || 640
      canvas.height = video.offsetHeight || 360
    }
    sync()

    const ro = new ResizeObserver(sync)
    ro.observe(video)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.font = '600 13px monospace'

      const positions = Array.from({ length: 7 }, () => ({
        x: 10 + Math.random() * Math.max(canvas.width - 280, 10),
        y: 20 + Math.random() * Math.max(canvas.height - 30, 20),
        opacity: 0.08 + Math.random() * 0.08,
      }))

      for (const { x, y, opacity } of positions) {
        ctx.fillStyle = `rgba(255,255,255,${opacity})`
        ctx.fillText(userEmail, x, y)
      }
    }

    draw()
    const interval = setInterval(draw, 3500)
    return () => {
      clearInterval(interval)
      ro.disconnect()
    }
  }, [userEmail])

  useEffect(() => {
    const check = () => {
      const threshold = 160
      setDevToolsOpen(
        window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold
      )
    }
    const interval = setInterval(check, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onContext = (e: MouseEvent) => e.preventDefault()

    const onKey = (e: KeyboardEvent) => {
      const hardBlocked = ['F12', 'F5', 'F11', 'PrintScreen']
      if (hardBlocked.includes(e.key)) {
        e.preventDefault()
        return
      }
      const combos: Array<{
        ctrl?: boolean
        shift?: boolean
        meta?: boolean
        alt?: boolean
        key: string
      }> = [
        { ctrl: true, key: 'u' },
        { ctrl: true, key: 's' },
        { ctrl: true, key: 'p' },
        { ctrl: true, key: 'a' },
        { ctrl: true, shift: true, key: 'i' },
        { ctrl: true, shift: true, key: 'j' },
        { ctrl: true, shift: true, key: 'c' },
        { ctrl: true, shift: true, key: 'u' },
        { meta: true, key: 'u' },
        { meta: true, shift: true, key: 'i' },
        { meta: true, alt: true, key: 'i' },
      ]
      for (const c of combos) {
        if (
          (c.ctrl === undefined || c.ctrl === e.ctrlKey) &&
          (c.shift === undefined || c.shift === e.shiftKey) &&
          (c.meta === undefined || c.meta === e.metaKey) &&
          (c.alt === undefined || c.alt === e.altKey) &&
          e.key.toLowerCase() === c.key
        ) {
          e.preventDefault()
          return
        }
      }
    }

    const onDrag = (e: DragEvent) => e.preventDefault()
    const onSelect = (e: Event) => e.preventDefault()

    document.addEventListener('contextmenu', onContext)
    document.addEventListener('keydown', onKey)
    document.addEventListener('dragstart', onDrag)
    document.addEventListener('selectstart', onSelect)

    return () => {
      document.removeEventListener('contextmenu', onContext)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('dragstart', onDrag)
      document.removeEventListener('selectstart', onSelect)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.disablePictureInPicture = true
    video.setAttribute('controlslist', 'nodownload noremoteplayback')
    video.setAttribute('disableremoteplayback', '')
  }, [])

  return (
    <div ref={containerRef} className="relative select-none">
      {devToolsOpen && (
        <div className="absolute inset-0 z-50 bg-[#080808] flex items-center justify-center rounded-2xl border border-white/5">
          <div className="text-center px-8">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-white font-semibold mb-2">Reproducción pausada</p>
            <p className="text-white/30 text-sm max-w-xs mx-auto">
              Cierra las herramientas de desarrollador para continuar viendo.
            </p>
          </div>
        </div>
      )}

      <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          controls
          playsInline
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ mixBlendMode: 'screen', opacity: 1 }}
        />
      </div>

      <div className="mt-3 flex items-center gap-2 text-white/15 text-xs select-none">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="flex-shrink-0"
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
        Contenido protegido · Uso personal e intransferible · Sesión vinculada a:{' '}
        <span className="text-white/25">{userEmail}</span>
      </div>
    </div>
  )
}
