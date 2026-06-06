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
    src: '/imagenes/Inmunoglobulina adeherida.jpg',
    position: '50% 68%',
    auth: true,
  },
  registro: {
    src: '/imagenes/Lluvia de Inmunoglobulina.png',
    position: '50% 50%',
    auth: true,
  },
  ver: {
    src: '/imagenes/Inmunoglobulina adeherida.jpg',
    position: '50% 48%',
    auth: false,
  },
}

export default function PageBackground({ scene }: Props) {
  const cfg = SCENES[scene]
  const isAuth = cfg.auth
  const isLogin = scene === 'login'

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-[#0B1928]">
        <div className="absolute inset-0 min-h-0 min-w-0">
          <Image
            src={cfg.src}
            alt=""
            fill
            priority
            quality={isLogin ? 95 : 92}
            sizes="100vw"
            className={`object-cover ${
              isLogin
                ? 'brightness-[0.94] saturate-[1.12] contrast-[1.04]'
                : isAuth
                ? 'saturate-[1.08] brightness-[0.88] dark:brightness-[0.72] dark:saturate-[1.1]'
                : 'saturate-[1.08] brightness-[0.92] dark:brightness-50 dark:saturate-[1.2]'
            }`}
            style={{ objectPosition: cfg.position }}
          />
        </div>
      </div>
      <div
        className={`fixed inset-0 -z-10 pointer-events-none ${
          isLogin
            ? 'bg-[radial-gradient(ellipse_130%_110%_at_50%_38%,transparent_0%,rgba(11,25,40,0.06)_50%,rgba(6,14,24,0.38)_100%)]'
            : isAuth
            ? 'bg-gradient-to-br from-background/75 via-background/65 to-background/80 dark:from-[rgba(8,20,36,0.35)] dark:via-[rgba(4,12,24,0.45)] dark:to-[rgba(4,12,24,0.5)]'
            : 'bg-gradient-to-br from-background/82 via-background/72 to-background/85 dark:from-[rgba(8,20,36,0.45)] dark:via-[rgba(4,12,24,0.55)] dark:to-[rgba(4,12,24,0.6)]'
        }`}
      />
    </>
  )
}
