import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'
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
  certificateCode: string
  templateUrl: string
  verifyUrl: string
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
  const mono = await pdfDoc.embedFont(StandardFonts.Helvetica)

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

  const qrDataUrl = await QRCode.toDataURL(params.verifyUrl, {
    margin: 0,
    width: 180,
    color: { dark: '#1e3a5f', light: '#ffffff' },
  })
  const qrBase64 = qrDataUrl.split(',')[1] ?? ''
  const qrBytes = Uint8Array.from(atob(qrBase64), c => c.charCodeAt(0))
  const qrImage = await pdfDoc.embedPng(qrBytes)

  const qrX = width - CERT_LAYOUT.qrSize - CERT_LAYOUT.qrRight
  const qrY = CERT_LAYOUT.qrBottom

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: CERT_LAYOUT.qrSize,
    height: CERT_LAYOUT.qrSize,
  })

  const code = params.certificateCode
  const codeWidth = mono.widthOfTextAtSize(code, CERT_LAYOUT.codeSize)
  page.drawText(code, {
    x: qrX + (CERT_LAYOUT.qrSize - codeWidth) / 2,
    y: qrY - CERT_LAYOUT.codeGap,
    size: CERT_LAYOUT.codeSize,
    font: mono,
    color: rgb(0.45, 0.5, 0.58),
  })

  return pdfDoc.save()
}

export async function downloadAttendanceCertificatePdf(
  certificate: AttendanceCertificateData,
  origin: string,
) {
  const verifyUrl = buildAttendanceVerifyUrl(certificate.certificateCode, origin)
  const bytes = await buildAttendanceCertificatePdf({
    fullName: certificate.recipient.fullName,
    certificateCode: certificate.certificateCode,
    templateUrl: getCertificateTemplatePdf(certificate),
    verifyUrl,
  })
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
