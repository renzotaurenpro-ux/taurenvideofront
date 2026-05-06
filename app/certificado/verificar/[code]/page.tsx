'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import ScaiLogo from '../../../../Logotipo-SCAI.png'
import { verifyCertificate, type CertVerifyResult } from '@/lib/exams'

export default function VerificarCertificadoPage() {
  const { code } = useParams<{ code: string }>()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<CertVerifyResult | null>(null)

  useEffect(() => {
    if (!code) { setLoading(false); return }
    verifyCertificate(code as string)
      .then(r => setData(r))
      .finally(() => setLoading(false))
  }, [code])

  return (
    <main className="min-h-screen bg-white text-black p-6 sm:p-10 flex items-center justify-center">
      <div className="w-full max-w-lg border p-8 sm:p-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Image src={ScaiLogo} alt="SCAI" className="h-8 w-auto" style={{ filter: 'invert(1) brightness(0)' }} />
          <p className="text-xs uppercase tracking-widest text-black/40">Verificación de certificado</p>
        </div>

        {loading ? (
          <div className="text-sm text-black/50">Verificando...</div>
        ) : !data ? (
          <div className="flex items-center gap-3 text-red-600">
            <XCircle size={28} />
            <p className="font-semibold">No se pudo verificar el certificado.</p>
          </div>
        ) : !data.valid ? (
          <div className="flex items-center gap-3 text-red-600">
            <XCircle size={28} />
            <div>
              <p className="font-bold text-lg">Certificado no válido</p>
              <p className="text-sm text-black/50 mt-1">El código ingresado no corresponde a un certificado emitido.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle size={28} />
              <div>
                <p className="font-bold text-lg">Certificado válido</p>
                <p className="text-sm text-black/50 mt-0.5">Código: {data.certificateCode}</p>
              </div>
            </div>

            <div className="border-t pt-5 space-y-3 text-sm">
              {data.user && (
                <div className="flex justify-between gap-4">
                  <span className="text-black/40">Profesional</span>
                  <span className="font-semibold text-right">{data.user.firstName} {data.user.lastName}</span>
                </div>
              )}
              {data.user?.email && (
                <div className="flex justify-between gap-4">
                  <span className="text-black/40">Email</span>
                  <span className="text-right">{data.user.email}</span>
                </div>
              )}
              {data.exam?.title && (
                <div className="flex justify-between gap-4">
                  <span className="text-black/40">Examen</span>
                  <span className="font-semibold text-right">{data.exam.title}</span>
                </div>
              )}
              {data.issuedAt && (
                <div className="flex justify-between gap-4">
                  <span className="text-black/40">Emitido</span>
                  <span className="text-right">{new Date(data.issuedAt).toLocaleDateString('es-CL')}</span>
                </div>
              )}
            </div>
          </>
        )}

        <div className="border-t pt-4 text-center">
          <Link href="/" className="text-xs text-black/40 underline hover:text-black">
            Sociedad Chilena de Alergia e Inmunología · SCAI
          </Link>
        </div>
      </div>
    </main>
  )
}
