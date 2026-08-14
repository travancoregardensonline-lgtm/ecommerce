import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/components/store/ProductCard'

interface WishlistStore {
    items: Product[]
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    hasItem: (productId: string) => boolean
    clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product) => {
                set((state) => {
                    if (state.items.some(i => i.id === product.id)) {
                        return state; // Already exists
                    }
                    return { items: [...state.items, product] }
                })
            },

            removeItem: (productId) => {
                set((state) => ({
                    items: state.items.filter(i => i.id !== productId)
                }))
            },

            hasItem: (productId) => {
                return get().items.some(i => i.id === productId)
            },

            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'travancore-wishlist',
        }
    )
)
