export function videoThumbnail(numero: number): string | undefined {
  if (numero < 1 || numero > 15) return undefined
  return `/portadas/${String(numero).padStart(2, '0')}.jpg`
}
