export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    phone: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                }
                Update: {
                    full_name?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                }
            }
            addresses: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    phone: string
                    line1: string
                    line2: string | null
                    city: string
                    state: string
                    pincode: string
                    country: string
                    is_default: boolean
                    created_at: string
                }
                Insert: {
                    user_id: string
                    name: string
                    phone: string
                    line1: string
                    line2?: string | null
                    city: string
                    state: string
                    pincode: string
                    country?: string
                    is_default?: boolean
                }
                Update: {
                    name?: string
                    phone?: string
                    line1?: string
                    line2?: string | null
                    city?: string
                    state?: string
                    pincode?: string
                    country?: string
                    is_default?: boolean
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    image_url: string | null
                    created_at: string
                }
                Insert: {
                    name: string
                    slug: string
                    description?: string | null
                    image_url?: string | null
                }
                Update: {
                    name?: string
                    slug?: string
                    description?: string | null
                    image_url?: string | null
                }
            }
            products: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    description: string | null
                    price: number
                    sale_price: number | null
                    category_id: string | null
                    primary_image_url: string | null
                    stock_qty: number
                    is_active: boolean
                    care_light: string | null
                    care_water: string | null
                    care_temp: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    name: string
                    slug: string
                    description?: string | null
                    price: number
                    sale_price?: number | null
                    category_id?: string | null
                    primary_image_url?: string | null
                    stock_qty?: number
                    is_active?: boolean
                    care_light?: string | null
                    care_water?: string | null
                    care_temp?: string | null
                }
                Update: {
                    name?: string
                    slug?: string
                    description?: string | null
                    price?: number
                    sale_price?: number | null
                    category_id?: string | null
                    primary_image_url?: string | null
                    stock_qty?: number
                    is_active?: boolean
                    care_light?: string | null
                    care_water?: string | null
                    care_temp?: string | null
                }
            }
            product_images: {
                Row: {
                    id: string
                    product_id: string
                    image_url: string
                    public_id: string | null
                    is_primary: boolean
                    created_at: string
                }
                Insert: {
                    product_id: string
                    image_url: string
                    public_id?: string | null
                    is_primary?: boolean
                }
                Update: {
                    image_url?: string
                    public_id?: string | null
                    is_primary?: boolean
                }
            }
            orders: {
                Row: {
                    id: string
                    user_id: string
                    status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
                    total_amount: number
                    shipping_amount: number
                    discount_amount: number
                    address_id: string | null
                    payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
                    payment_method: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    status?: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
                    total_amount: number
                    shipping_amount?: number
                    discount_amount?: number
                    address_id?: string | null
                    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
                    payment_method?: string | null
                    notes?: string | null
                }
                Update: {
                    status?: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
                    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
                    notes?: string | null
                }
            }
            order_items: {
                Row: {
                    id: string
                    order_id: string
                    product_id: string
                    product_name: string
                    product_image_url: string | null
                    quantity: number
                    unit_price: number
                    total_price: number
                }
                Insert: {
                    order_id: string
                    product_id: string
                    product_name: string
                    product_image_url?: string | null
                    quantity: number
                    unit_price: number
                    total_price: number
                }
                Update: never
            }
            reviews: {
                Row: {
                    id: string
                    product_id: string
                    user_id: string
                    rating: number
                    comment: string | null
                    is_verified: boolean
                    created_at: string
                }
                Insert: {
                    product_id: string
                    user_id: string
                    rating: number
                    comment?: string | null
                }
                Update: {
                    rating?: number
                    comment?: string | null
                }
            }
        }
    }
}
