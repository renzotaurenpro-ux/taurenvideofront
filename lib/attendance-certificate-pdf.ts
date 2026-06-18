import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import QRCode from 'qrcode'
import { ATTENDANCE_VERIFY_PATH } from './attendance'

const TEMPLATE_URL = '/certificados/plantilla-asistencia.pdf'
const PAGE_W = 810
const PAGE_H = 630
const NAME_Y_FROM_TOP = 293
const NAME_SIZE = 30
const QR_SIZE = 54
const QR_MARGIN_RIGHT = 38
const QR_MARGIN_BOTTOM = 34

type BuildParams = {
  fullName: string
  certificateCode: string
  verifyUrl: string
}

export function buildAttendanceVerifyUrl(certificateCode: string, origin: string) {
  return `${origin}${ATTENDANCE_VERIFY_PATH}/${certificateCode}`
}

export async function buildAttendanceCertificatePdf(params: BuildParams): Promise<Uint8Array> {
  const templateBytes = await fetch(TEMPLATE_URL).then(r => {
    if (!r.ok) throw new Error('No se pudo cargar la plantilla del certificado')
    return r.arrayBuffer()
  })

  const pdfDoc = await PDFDocument.load(templateBytes)
  const page = pdfDoc.getPages()[0]
  const { width, height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const mono = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const name = params.fullName.trim()
  const textWidth = font.widthOfTextAtSize(name, NAME_SIZE)
  page.drawText(name, {
    x: (width - textWidth) / 2,
    y: height - NAME_Y_FROM_TOP - NAME_SIZE * 0.35,
    size: NAME_SIZE,
    font,
    color: rgb(0.07, 0.09, 0.15),
  })

  const qrDataUrl = await QRCode.toDataURL(params.verifyUrl, {
    margin: 0,
    width: 180,
    color: { dark: '#1e3a5f', light: '#e8eef5' },
  })
  const qrBase64 = qrDataUrl.split(',')[1] ?? ''
  const qrBytes = Uint8Array.from(atob(qrBase64), c => c.charCodeAt(0))
  const qrImage = await pdfDoc.embedPng(qrBytes)

  const qrX = width - QR_SIZE - QR_MARGIN_RIGHT
  const qrY = QR_MARGIN_BOTTOM
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: QR_SIZE,
    height: QR_SIZE,
  })

  const code = params.certificateCode
  const codeSize = 5.5
  const codeWidth = mono.widthOfTextAtSize(code, codeSize)
  page.drawText(code, {
    x: qrX + (QR_SIZE - codeWidth) / 2,
    y: qrY - 9,
    size: codeSize,
    font: mono,
    color: rgb(0.45, 0.5, 0.58),
  })

  return pdfDoc.save()
}

export async function downloadAttendanceCertificatePdf(
  fullName: string,
  certificateCode: string,
  origin: string,
) {
  const verifyUrl = buildAttendanceVerifyUrl(certificateCode, origin)
  const bytes = await buildAttendanceCertificatePdf({ fullName, certificateCode, verifyUrl })
  const blob = new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const safeName = fullName.replace(/[\\/:*?"<>|]+/g, '').trim() || 'asistencia'
  const a = document.createElement('a')
  a.href = url
  a.download = `certificado-asistencia-${safeName}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export const ATTENDANCE_CERT_ASPECT = PAGE_W / PAGE_H
