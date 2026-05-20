'use client'

import Image from 'next/image'

type Props = {
  variant?: 'auth' | 'app'
}

export default function PageBackground({ variant = 'app' }: Props) {
  const isAuth = variant === 'auth'

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <Image
          src="/imagenes/iamgen oficial.jpg"
          alt=""
          fill
          priority
          quality={92}
          sizes="100vw"
          className="object-cover object-center"
          style={{
            filter: isAuth ? 'brightness(0.72) saturate(1.1)' : 'brightness(0.5) saturate(1.2)',
          }}
        />
      </div>
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: isAuth
            ? 'linear-gradient(160deg, rgba(8,20,36,0.35) 0%, rgba(4,12,24,0.5) 100%)'
            : 'linear-gradient(160deg, rgba(8,20,36,0.45) 0%, rgba(4,12,24,0.6) 100%)',
        }}
      />
    </>
  )
}
