export const PRICE_CLP = 30000

export function formatCLP(n: number) {
  return '$' + n.toLocaleString('es-CL')
}

export function coursePrice(priceClp?: number | null) {
  return PRICE_CLP
}
