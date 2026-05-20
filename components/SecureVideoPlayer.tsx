'use client'

interface Props {
  videoUrl: string
  mimeType?: string
  onError?: () => void
  onReady?: () => void
}

export default function SecureVideoPlayer({ videoUrl, mimeType, onError, onReady }: Props) {
  const isEmbed =
    videoUrl.startsWith('http') &&
    (videoUrl.includes('iframe.mediadelivery.net') || videoUrl.includes('youtu'))

  return (
    <div className="relative select-none w-full">
      <div className="relative bg-black rounded-2xl overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
        {videoUrl && isEmbed ? (
          <iframe
            key={videoUrl}
            src={videoUrl}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            onLoad={() => onReady?.()}
          />
        ) : videoUrl ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-contain bg-black"
            onCanPlay={() => onReady?.()}
            onError={() => onError?.()}
          >
            <source src={videoUrl} type={mimeType ?? 'video/mp4'} />
          </video>
        ) : null}
      </div>
    </div>
  )
}
