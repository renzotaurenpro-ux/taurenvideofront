export type CartItem = {
  id: string
  title: string
  subtitle?: string
  priceNeto: number
  quantity: number
}

const CART_KEY = 'tauren-cart'

function safeParse(json: string | null): unknown {
  try {
    if (!json) return null
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  const raw = safeParse(localStorage.getItem(CART_KEY))
  if (!Array.isArray(raw)) return []
  return raw
    .filter(Boolean)
    .map((x: any) => ({
      id: String(x.id || ''),
      title: String(x.title || ''),
      subtitle: x.subtitle ? String(x.subtitle) : undefined,
      priceNeto: Number(x.priceNeto || 0),
      quantity: Math.max(1, Number(x.quantity || 1)),
    }))
    .filter(x => x.id && x.title && Number.isFinite(x.priceNeto) && x.priceNeto > 0)
}

export function setCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('tauren-cart-updated'))
}

export function clearCart() {
  setCart([])
}

export function cartCount(items?: CartItem[]) {
  const it = items ?? getCart()
  return it.reduce((acc, x) => acc + (x.quantity || 0), 0)
}

export function addToCart(item: Omit<CartItem, 'quantity'>, quantity = 1) {
  const items = getCart()
  const idx = items.findIndex(x => x.id === item.id)
  if (idx >= 0) {
    items[idx] = { ...items[idx], quantity: items[idx].quantity + Math.max(1, quantity) }
  } else {
    items.push({ ...item, quantity: Math.max(1, quantity) })
  }
  setCart(items)
}

export function removeFromCart(id: string) {
  setCart(getCart().filter(x => x.id !== id))
}

export function hasItem(id: string) {
  return getCart().some(x => x.id === id)
}

