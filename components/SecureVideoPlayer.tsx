'use client'

interface Props {
  videoUrl: string
  mimeType?: string
}

export default function SecureVideoPlayer({ videoUrl, mimeType }: Props) {
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
            key={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-contain bg-black"
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
            key={videoUrl}
            src={videoUrl}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-contain bg-black"
          />
        ) : null}
      </div>
    </div>
  )
}
