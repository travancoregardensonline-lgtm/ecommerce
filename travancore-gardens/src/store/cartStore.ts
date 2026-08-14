import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

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
    cartId: string | null
    setCartId: (id: string | null) => void
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
            cartId: null,
            setCartId: (id) => set({ cartId: id }),

            addItem: async (item) => {
                const state = get()
                const existing = state.items.find(i => i.product_id === item.product_id && i.variant === item.variant)
                const qtyToAdd = item.quantity ?? 1
                
                // Optimistic UI update
                if (existing) {
                    set({
                        items: state.items.map(i =>
                            i.product_id === item.product_id && i.variant === item.variant
                                ? { ...i, quantity: i.quantity + qtyToAdd }
                                : i
                        )
                    })
                } else {
                    set({ items: [...state.items, { ...item, quantity: qtyToAdd }] })
                }

                // Supabase sync
                const cartId = get().cartId
                if (cartId) {
                    const supabase = createClient()
                    if (existing) {
                        const { data: remoteItems } = await supabase.from("cart_items").select("id, quantity").eq("cart_id", cartId).eq("product_id", item.product_id)
                        const remoteItem = remoteItems?.[0]
                        if (remoteItem) {
                            await supabase.from("cart_items").update({ quantity: remoteItem.quantity + qtyToAdd }).eq("id", remoteItem.id)
                        }
                    } else {
                        await supabase.from("cart_items").insert({
                            cart_id: cartId,
                            product_id: item.product_id,
                            quantity: qtyToAdd
                        })
                    }
                }
            },

            removeItem: async (productId) => {
                set((state) => ({
                    items: state.items.filter(i => i.product_id !== productId)
                }))

                const cartId = get().cartId
                if (cartId) {
                    const supabase = createClient()
                    await supabase.from("cart_items").delete().eq("cart_id", cartId).eq("product_id", productId)
                }
            },

            updateQuantity: async (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId)
                    return
                }
                set((state) => ({
                    items: state.items.map(i =>
                        i.product_id === productId ? { ...i, quantity } : i
                    )
                }))

                const cartId = get().cartId
                if (cartId) {
                    const supabase = createClient()
                    await supabase.from("cart_items").update({ quantity }).eq("cart_id", cartId).eq("product_id", productId)
                }
            },

            clearCart: () => {
                set({ items: [] })
                const cartId = get().cartId
                if (cartId) {
                    const supabase = createClient()
                    supabase.from("cart_items").delete().eq("cart_id", cartId)
                }
            },

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
