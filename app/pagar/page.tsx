'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PagarPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/carrito') }, [router])
  return null
}
