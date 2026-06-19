import type { AttendanceCertificateData, AttendanceCertificateType } from './attendance'

export const PAGE_W = 810
export const PAGE_H = 630
export const ATTENDANCE_CERT_ASPECT = PAGE_W / PAGE_H

export const CERT_LAYOUT = {
  nameBaselineY: 252,
  nameMaxSize: 30,
  nameMaxWidth: 712,
  qrSize: 54,
  qrRight: 38,
  qrBottom: 34,
  codeSize: 5.5,
  codeGap: 9,
}

const TEMPLATE_PDF: Record<AttendanceCertificateType, string> = {
  LIVE_VIEWING: '/certificados/plantilla-asistencia-vivo.pdf',
  EXAM: '/certificados/plantilla-examen.pdf',
}

export function resolveCertificateTemplateType(
  data: Pick<AttendanceCertificateData, 'certificateType'>,
): AttendanceCertificateType {
  return data.certificateType === 'EXAM' ? 'EXAM' : 'LIVE_VIEWING'
}

export function getCertificateTemplatePdf(
  data: Pick<AttendanceCertificateData, 'certificateType'>,
): string {
  return TEMPLATE_PDF[resolveCertificateTemplateType(data)]
}
