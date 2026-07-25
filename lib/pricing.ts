export const DEFAULT_PRICE_CLP = 25000

export function formatCLP(n: number) {
  return '$' + n.toLocaleString('es-CL')
}

export function coursePriceClp(priceClp?: number | null) {
  return typeof priceClp === 'number' && Number.isFinite(priceClp) && priceClp > 0
    ? priceClp
    : DEFAULT_PRICE_CLP
}
