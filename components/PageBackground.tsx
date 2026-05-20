'use client'

import Image from 'next/image'

type Scene = 'login' | 'registro' | 'ver'

type Props = {
  scene: Scene
}

const SCENES: Record<
  Scene,
  { src: string; position: string; auth: boolean }
> = {
  login: {
    src: '/imagenes/Inmunoglobulina oscura.png',
    position: '50% 108%',
    auth: true,
  },
  registro: {
    src: '/imagenes/Lluvia de Inmunoglobulina.png',
    position: '50% 50%',
    auth: true,
  },
  ver: {
    src: '/imagenes/iamgen oficial.jpg',
    position: '50% 42%',
    auth: false,
  },
}

export default function PageBackground({ scene }: Props) {
  const cfg = SCENES[scene]
  const isAuth = cfg.auth

  return (
    <>
      <div
        className={`fixed inset-0 -z-10 pointer-events-none overflow-hidden ${
          scene === 'login'
            ? '[mask-image:radial-gradient(ellipse_105%_95%_at_50%_88%,#000_18%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_105%_95%_at_50%_88%,#000_18%,transparent_100%)]'
            : ''
        }`}
      >
        <Image
          src={cfg.src}
          alt=""
          fill
          priority
          quality={92}
          sizes="100vw"
          className={`object-cover saturate-[1.05] ${
            scene === 'login'
              ? 'brightness-[0.95] scale-[1]'
              : isAuth
              ? 'brightness-[0.88] dark:brightness-[0.72] dark:saturate-[1.1]'
              : 'brightness-[0.92] dark:brightness-50 dark:saturate-[1.2]'
          }`}
          style={{ objectPosition: cfg.position }}
        />
      </div>
      <div
        className={`fixed inset-0 -z-10 pointer-events-none ${
          scene === 'login'
            ? 'bg-[radial-gradient(ellipse_85%_55%_at_50%_12%,rgba(11,25,40,0.72)_0%,rgba(11,25,40,0.22)_42%,transparent_62%),radial-gradient(ellipse_120%_45%_at_50%_112%,transparent_0%,rgba(11,25,40,0.08)_45%,rgba(11,25,40,0.35)_100%)]'
            : isAuth
            ? 'bg-gradient-to-br from-background/75 via-background/65 to-background/80 dark:from-[rgba(8,20,36,0.35)] dark:via-[rgba(4,12,24,0.45)] dark:to-[rgba(4,12,24,0.5)]'
            : 'bg-gradient-to-br from-background/82 via-background/72 to-background/85 dark:from-[rgba(8,20,36,0.45)] dark:via-[rgba(4,12,24,0.55)] dark:to-[rgba(4,12,24,0.6)]'
        }`}
      />
    </>
  )
}
