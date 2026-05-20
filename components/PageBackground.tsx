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
    position: '50% 118%',
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
            ? '[mask-image:radial-gradient(ellipse_100%_88%_at_50%_78%,#000_28%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_100%_88%_at_50%_78%,#000_28%,transparent_100%)]'
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
              ? 'brightness-[0.82] scale-[1.08]'
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
            ? 'bg-[radial-gradient(ellipse_100%_70%_at_50%_8%,rgba(11,25,40,0.88)_0%,rgba(11,25,40,0.4)_38%,transparent_68%),radial-gradient(ellipse_140%_50%_at_50%_108%,transparent_0%,rgba(11,25,40,0.15)_35%,rgba(11,25,40,0.75)_100%)]'
            : isAuth
            ? 'bg-gradient-to-br from-background/75 via-background/65 to-background/80 dark:from-[rgba(8,20,36,0.35)] dark:via-[rgba(4,12,24,0.45)] dark:to-[rgba(4,12,24,0.5)]'
            : 'bg-gradient-to-br from-background/82 via-background/72 to-background/85 dark:from-[rgba(8,20,36,0.45)] dark:via-[rgba(4,12,24,0.55)] dark:to-[rgba(4,12,24,0.6)]'
        }`}
      />
    </>
  )
}
