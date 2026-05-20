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
    src: '/imagenes/iamgen oficial.jpg',
    position: '18% 42%',
    auth: true,
  },
  registro: {
    src: '/imagenes/Lluvia de Inmunoglobulina.png',
    position: '50% 50%',
    auth: true,
  },
  ver: {
    src: '/imagenes/Inmunoglobulina adeherida.jpg',
    position: '50% 42%',
    auth: false,
  },
}

export default function PageBackground({ scene }: Props) {
  const cfg = SCENES[scene]
  const isAuth = cfg.auth

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <Image
          src={cfg.src}
          alt=""
          fill
          priority
          quality={92}
          sizes="100vw"
          className={`object-cover saturate-[1.05] ${
            isAuth
              ? 'brightness-[0.88] dark:brightness-[0.72] dark:saturate-[1.1]'
              : 'brightness-[0.92] dark:brightness-50 dark:saturate-[1.2]'
          }`}
          style={{ objectPosition: cfg.position }}
        />
      </div>
      <div
        className={`fixed inset-0 -z-10 pointer-events-none ${
          scene === 'login'
            ? 'bg-gradient-to-r from-transparent from-0% via-[rgba(4,12,24,0.12)] via-[32%] to-[rgba(4,12,24,0.78)] to-100% dark:from-transparent dark:via-[rgba(4,12,24,0.08)] dark:via-[28%] dark:to-[rgba(4,12,24,0.82)]'
            : isAuth
            ? 'bg-gradient-to-br from-background/75 via-background/65 to-background/80 dark:from-[rgba(8,20,36,0.35)] dark:via-[rgba(4,12,24,0.45)] dark:to-[rgba(4,12,24,0.5)]'
            : 'bg-gradient-to-br from-background/82 via-background/72 to-background/85 dark:from-[rgba(8,20,36,0.45)] dark:via-[rgba(4,12,24,0.55)] dark:to-[rgba(4,12,24,0.6)]'
        }`}
      />
    </>
  )
}
