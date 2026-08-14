import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string
    product_id: string
    name: string
    slug: string
    price: number
    sale_price?: number | null
    image_url: string
    quantity: number
    weight?: number
    variant?: string
}

interface CartStore {
    items: CartItem[]
    isOpen: boolean
    addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    setIsOpen: (open: boolean) => void
    getTotalItems: () => number
    getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (item) => {
                set((state) => {
                    const existing = state.items.find(i => i.product_id === item.product_id && i.variant === item.variant)
                    if (existing) {
                        return {
                            items: state.items.map(i =>
                                i.product_id === item.product_id && i.variant === item.variant
                                    ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
                                    : i
                            )
                        }
                    }
                    return { items: [...state.items, { ...item, quantity: item.quantity ?? 1 }] }
                })
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter(i => i.product_id !== productId)
                }))
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId)
                    return
                }
                set((state) => ({
                    items: state.items.map(i =>
                        i.product_id === productId ? { ...i, quantity } : i
                    )
                }))
            },

            clearCart: () => set({ items: [] }),

            setIsOpen: (open) => set({ isOpen: open }),

            getTotalItems: () => {
                return get().items.reduce((sum, i) => sum + i.quantity, 0)
            },

            getTotalPrice: () => {
                return get().items.reduce((sum, i) => {
                    const price = i.sale_price ?? i.price
                    return sum + price * i.quantity
                }, 0)
            },
        }),
        {
            name: 'travancore-cart',
        }
    )
)
