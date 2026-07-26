export const DEFAULT_PRICE_NETO = 25000
export const IVA_RATE = 0.19

export function formatCLP(n: number) {
  return '$' + n.toLocaleString('es-CL')
}

export function coursePriceNeto(priceClp?: number | null) {
  return typeof priceClp === 'number' && Number.isFinite(priceClp) && priceClp > 0
    ? Math.round(priceClp)
    : DEFAULT_PRICE_NETO
}

export function coursePriceIva(neto: number) {
  return Math.round(neto * IVA_RATE)
}

export function coursePriceTotal(priceClp?: number | null) {
  const neto = coursePriceNeto(priceClp)
  return neto + coursePriceIva(neto)
}
