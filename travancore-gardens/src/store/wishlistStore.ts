import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/components/store/ProductCard'
import { createClient } from '@/lib/supabase/client'

interface WishlistStore {
    items: Product[]
    wishlistId: string | null
    setWishlistId: (id: string | null) => void
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    hasItem: (productId: string) => boolean
    clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],
            wishlistId: null,
            setWishlistId: (id) => set({ wishlistId: id }),

            addItem: async (product) => {
                const state = get()
                if (state.items.some(i => i.id === product.id)) return

                set((state) => ({ items: [...state.items, product] }))

                const wishlistId = get().wishlistId
                if (wishlistId) {
                    const supabase = createClient()
                    await supabase.from("wishlist_items").insert({
                        wishlist_id: wishlistId,
                        product_id: product.id
                    })
                }
            },

            removeItem: async (productId) => {
                set((state) => ({
                    items: state.items.filter(i => i.id !== productId)
                }))

                const wishlistId = get().wishlistId
                if (wishlistId) {
                    const supabase = createClient()
                    await supabase.from("wishlist_items").delete().eq("wishlist_id", wishlistId).eq("product_id", productId)
                }
            },

            hasItem: (productId) => {
                return get().items.some(i => i.id === productId)
            },

            clearWishlist: () => {
                set({ items: [] })
                const wishlistId = get().wishlistId
                if (wishlistId) {
                    const supabase = createClient()
                    supabase.from("wishlist_items").delete().eq("wishlist_id", wishlistId)
                }
            },
        }),
        {
            name: 'travancore-wishlist',
        }
    )
)
