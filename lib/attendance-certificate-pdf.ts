import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import {
  ATTENDANCE_VERIFY_PATH,
  type AttendanceCertificateData,
} from './attendance'
import {
  CERT_LAYOUT,
  getCertificateTemplatePdf,
} from './attendance-certificate-layout'

type BuildParams = {
  fullName: string
  templateUrl: string
}

export function buildAttendanceVerifyUrl(certificateCode: string, origin: string) {
  return `${origin}${ATTENDANCE_VERIFY_PATH}/${certificateCode}`
}

function fitFontSize(
  text: string,
  font: Awaited<ReturnType<PDFDocument['embedFont']>>,
  maxSize: number,
  maxWidth: number,
) {
  let size = maxSize
  while (size > 7 && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 0.5
  }
  return size
}

export async function buildAttendanceCertificatePdf(params: BuildParams): Promise<Uint8Array> {
  const templateBytes = await fetch(params.templateUrl).then(r => {
    if (!r.ok) throw new Error('No se pudo cargar la plantilla del certificado')
    return r.arrayBuffer()
  })

  const pdfDoc = await PDFDocument.load(templateBytes)
  const page = pdfDoc.getPages()[0]
  const { width } = page.getSize()
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const name = params.fullName.trim()
  const nameSize = fitFontSize(name, fontBold, CERT_LAYOUT.nameMaxSize, CERT_LAYOUT.nameMaxWidth)
  const nameWidth = fontBold.widthOfTextAtSize(name, nameSize)

  page.drawText(name, {
    x: (width - nameWidth) / 2,
    y: CERT_LAYOUT.nameBaselineY,
    size: nameSize,
    font: fontBold,
    color: rgb(0.07, 0.09, 0.15),
  })

  return pdfDoc.save()
}

export async function buildAttendanceCertificatePdfBytes(
  certificate: AttendanceCertificateData,
): Promise<Uint8Array> {
  return buildAttendanceCertificatePdf({
    fullName: certificate.recipient.fullName,
    templateUrl: getCertificateTemplatePdf(certificate),
  })
}

export async function createAttendanceCertificatePreviewUrl(
  certificate: AttendanceCertificateData,
  _origin: string,
): Promise<string> {
  const bytes = await buildAttendanceCertificatePdfBytes(certificate)
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' })
  return URL.createObjectURL(blob)
}

export async function downloadAttendanceCertificatePdf(
  certificate: AttendanceCertificateData,
  _origin: string,
) {
  const bytes = await buildAttendanceCertificatePdfBytes(certificate)
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const safeName = certificate.recipient.fullName.replace(/[\\/:*?"<>|]+/g, '').trim() || 'asistencia'
  const slug = certificate.certificateType === 'EXAM' ? 'examen' : 'asistencia-vivo'
  const a = document.createElement('a')
  a.href = url
  a.download = `certificado-${slug}-${safeName}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export { ATTENDANCE_CERT_ASPECT } from './attendance-certificate-layout'
