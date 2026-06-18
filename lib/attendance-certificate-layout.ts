import type { AttendanceCertificateData } from './attendance'
import { resolveCertificateBodyText, resolveCertificateHeading } from './attendance'

export const ATTENDANCE_CERT_ASPECT = 810 / 630

export const CERT_BG = '#eef1f5'

export function needsBodyOverlay(data: Pick<AttendanceCertificateData, 'certificateType'>) {
  return data.certificateType === 'EXAM' || data.certificateType === 'LIVE_VIEWING'
}

export function getCertificateOverlayContent(data: AttendanceCertificateData) {
  return {
    heading: resolveCertificateHeading(data),
    bodyText: resolveCertificateBodyText(data),
    replaceBody: needsBodyOverlay(data),
  }
}
