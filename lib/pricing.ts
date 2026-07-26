export const PRICE_NETO = 25000
export const PRICE_IVA = 4750
export const PRICE_TOTAL = 29750

export function formatCLP(n: number) {
  return '$' + n.toLocaleString('es-CL')
}

export function resolvePricing(priceClp?: number | null) {
  const raw = typeof priceClp === 'number' && Number.isFinite(priceClp) && priceClp > 0
    ? Math.round(priceClp)
    : PRICE_NETO

  if (raw === PRICE_TOTAL || raw > PRICE_NETO) {
    return { neto: PRICE_NETO, iva: PRICE_IVA, total: PRICE_TOTAL }
  }

  const iva = Math.round(raw * 0.19)
  return { neto: raw, iva, total: raw + iva }
}
