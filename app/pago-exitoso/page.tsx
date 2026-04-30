'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PagoExitosoPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/payment/success') }, [router])
  return null
}
