'use client'

interface Props {
  videoUrl: string
  mimeType?: string
  onError?: () => void
}

export default function SecureVideoPlayer({ videoUrl, mimeType, onError }: Props) {
  const isEmbed =
    videoUrl.startsWith('http') &&
    (videoUrl.includes('iframe.mediadelivery.net') ||
      videoUrl.includes('player.vimeo.com') ||
      videoUrl.includes('youtube.com') ||
      videoUrl.includes('youtu.be'))

  const isLocal = videoUrl.startsWith('/videos/')
  const mime = mimeType ?? (isLocal && videoUrl.includes('.mov') ? 'video/quicktime' : 'video/mp4')

  return (
    <div className="relative select-none w-full">
      <div className="relative bg-black rounded-2xl overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
        {videoUrl && isLocal ? (
          <video
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-contain bg-black"
            onError={() => onError?.()}
          >
            <source src={videoUrl} type={mime} />
          </video>
        ) : videoUrl && isEmbed ? (
          <iframe
            src={videoUrl}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : videoUrl ? (
          <video
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-contain bg-black"
            onError={() => onError?.()}
          />
        ) : null}
      </div>
    </div>
  )
}
