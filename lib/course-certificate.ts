import type { AttendanceCertificateData } from './attendance'
import type { Certificate, CertVerifyResult } from './exams'
import {
  SITE_EVENT_NAME,
  SITE_EVENT_SUBTITLE,
} from './site-config'

type ProfileLike = {
  firstName?: string
  lastName?: string
  email?: string
} | null

export function buildCourseAttendanceCertificate(params: {
  cert: Certificate
  verify?: CertVerifyResult | null
  profile?: ProfileLike
  emailFallback?: string
}): AttendanceCertificateData | null {
  const { cert, verify, profile, emailFallback } = params
  const code = cert.certificateCode ?? verify?.certificateCode
  if (!code) return null

  const firstName =
    verify?.user?.firstName?.trim() ||
    profile?.firstName?.trim() ||
    ''
  const lastName =
    verify?.user?.lastName?.trim() ||
    profile?.lastName?.trim() ||
    ''
  const email =
    verify?.user?.email?.trim() ||
    profile?.email?.trim() ||
    emailFallback?.trim() ||
    ''

  const fullName = `${firstName} ${lastName}`.trim() || email || 'Profesional acreditado'

  return {
    certificateCode: code,
    certificateType: 'EXAM',
    certificateTitle: 'Certificado de Aprobación',
    certificateLabel: 'CERTIFICADO DE APROBACIÓN',
    issuedAt: verify?.issuedAt ?? cert.issuedAt ?? new Date().toISOString(),
    recipient: {
      firstName: firstName || fullName,
      lastName,
      fullName,
      email,
    },
    event: {
      organization: 'SOCIEDAD CHILENA DE ALERGIA E INMUNOLOGÍA',
      type: 'CERTIFICADO DE APROBACIÓN',
      eventTitle: SITE_EVENT_NAME,
      eventSubtitle: SITE_EVENT_SUBTITLE,
      eventDate: 'durante el período de acceso online',
      modality: 'online',
      director1: 'Dra. Rocío Tordecilla Fernández',
      director1Role: 'Directora Sociedad Chilena de Alergía e Inmunología',
      director2: 'Dra. Ligia Rodríguez Alvarez',
      director2Role: 'Directora de Redes Sociales y Regional de SCAI',
    },
  }
}
