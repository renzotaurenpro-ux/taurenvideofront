'use client'

interface Props {
  videoUrl: string
}

export default function SecureVideoPlayer({ videoUrl }: Props) {
  const isLocal = videoUrl.startsWith('/videos/')

  return (
    <div className="relative select-none w-full">
      <div className="relative bg-black rounded-2xl overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
        {videoUrl && isLocal ? (
          <video
            key={videoUrl}
            src={videoUrl}
            controls
            playsInline
            className="absolute inset-0 h-full w-full object-contain bg-black"
          />
        ) : videoUrl ? (
          <iframe
            src={videoUrl}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : null}
      </div>
    </div>
  )
}
