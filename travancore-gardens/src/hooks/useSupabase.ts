import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Helper — converts Supabase error object to a real Error
function toError(err: any): Error {
    if (err instanceof Error) return err;
    return new Error(err?.message ?? JSON.stringify(err) ?? "Supabase error");
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface ProductFilters {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: "price_asc" | "price_desc" | "newest" | "popular";
    page?: number;
    limit?: number;
}

export function useProducts(filters: ProductFilters = {}) {
    return useQuery({
        queryKey: ["products", filters],
        queryFn: async () => {
            const supabase = createClient();
            const { page = 1, limit = 12, sort = "newest", category, search, minPrice, maxPrice } = filters;

            let query = supabase
                .from("products")
                .select(`*, categories(name, slug), product_images(image_url, is_primary)`, { count: "exact" })
                .eq("is_active", true)
                .range((page - 1) * limit, page * limit - 1);

            if (search) query = query.ilike("name", `%${search}%`);
            if (minPrice !== undefined) query = query.gte("price", minPrice);
            if (maxPrice !== undefined) query = query.lte("price", maxPrice);
            if (sort === "price_asc") query = query.order("price", { ascending: true });
            else if (sort === "price_desc") query = query.order("price", { ascending: false });
            else query = query.order("created_at", { ascending: false });

            const { data, error, count } = await query;
            if (error) throw toError(error);

            const products = category
                ? (data ?? []).filter((p: any) => p.categories?.slug === category)
                : (data ?? []);

            return { products, total: count ?? 0 };
        },
    });
}

export function useProduct(slug: string) {
    return useQuery({
        queryKey: ["product", slug],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("products")
                .select(`
                    *,
                    categories(name, slug),
                    product_images(id, image_url, is_primary),
                    product_variants(id, variant_name, price, stock, sku),
                    reviews(id, rating, review, created_at, profiles(name, avatar_url))
                `)
                .eq("slug", slug)
                .eq("is_active", true)
                .maybeSingle();

            if (error) throw toError(error);
            return data;
        },
        enabled: !!slug,
    });
}

export function useFeaturedProducts(limit = 8) {
    return useQuery({
        queryKey: ["products", "featured", limit],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("products")
                .select("*, categories(name, slug), product_images(image_url, is_primary)")
                .eq("is_active", true)
                .order("created_at", { ascending: false })
                .limit(limit);

            if (error) throw toError(error);
            return data ?? [];
        },
    });
}

// ─── Banners ──────────────────────────────────────────────────────────────────

export function useBanners() {
    return useQuery({
        queryKey: ["banners"],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("banners")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (error) {
                // Return default fallback if table not yet created
                return [{
                    id: "default",
                    title: "Breathe <br /> <span class=\"text-primary italic font-serif lowercase font-medium\">Life</span> Into <br /> Your Space.",
                    subtitle: "Premium Nursery",
                    description: "Expertly curated indoor & outdoor plants, delivered directly from our nursery to your doorstep.",
                    image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600",
                    button_text: "Start Shopping",
                    button_link: "/shop"
                }];
            }
            if (!data || data.length === 0) {
                return [{
                    id: "default",
                    title: "Breathe <br /> <span class=\"text-primary italic font-serif lowercase font-medium\">Life</span> Into <br /> Your Space.",
                    subtitle: "Premium Nursery",
                    description: "Expertly curated indoor & outdoor plants, delivered directly from our nursery to your doorstep.",
                    image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600",
                    button_text: "Start Shopping",
                    button_link: "/shop"
                }];
            }
            return data;
        },
    });
}

export function useAdminBanners() {
    return useQuery({
        queryKey: ["admin-banners"],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("banners")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw toError(error);
            return data ?? [];
        },
    });
}

export function useCreateBanner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const supabase = createClient();
            const { data, error } = await supabase.from("banners").insert(payload).select().single();
            if (error) throw toError(error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
            queryClient.invalidateQueries({ queryKey: ["banners"] });
        }
    });
}

export function useUpdateBanner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const supabase = createClient();
            const { data, error } = await supabase.from("banners").update(updates).eq("id", id).select().single();
            if (error) throw toError(error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
            queryClient.invalidateQueries({ queryKey: ["banners"] });
        }
    });
}

export function useDeleteBanner() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const supabase = createClient();
            const { error } = await supabase.from("banners").delete().eq("id", id);
            if (error) throw toError(error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
            queryClient.invalidateQueries({ queryKey: ["banners"] });
        }
    });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("categories")
                .select("*, parent:categories(id, name)")
                .order("name");

            if (error) throw toError(error);
            return data ?? [];
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (category: any) => {
            const supabase = createClient();
            const { data, error } = await supabase.from("categories").insert(category).select().single();
            if (error) throw toError(error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("categories")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw toError(error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const supabase = createClient();
            const { error } = await supabase.from("categories").delete().eq("id", id);
            if (error) throw toError(error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
        },
    });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useMyOrders() {
    return useQuery({
        queryKey: ["my-orders"],
        queryFn: async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from("orders")
                .select(`
                    id, order_number, order_status, total_amount, payment_status, created_at,
                    order_items(
                        id, quantity, price,
                        products(id, name, slug, product_images(image_url, is_primary))
                    ),
                    addresses(full_name, address_line1, city, state)
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw toError(error);
            return data ?? [];
        },
    });
}

export function useOrder(orderId: string) {
    return useQuery({
        queryKey: ["order", orderId],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("orders")
                .select(`
                    *,
                    order_items(
                        id, quantity, price,
                        products(id, name, slug, product_images(image_url, is_primary))
                    ),
                    addresses(*)
                `)
                .eq("id", orderId)
                .maybeSingle();

            if (error) throw toError(error);
            return data;
        },
        enabled: !!orderId,
    });
}

// ─── Addresses ────────────────────────────────────────────────────────────────

export function useMyAddresses() {
    return useQuery({
        queryKey: ["my-addresses"],
        queryFn: async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from("addresses")
                .select("*")
                .eq("user_id", user.id)
                .order("is_default", { ascending: false });

            if (error) throw toError(error);
            return data ?? [];
        },
    });
}

export function useSaveAddress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (address: {
            id?: string;
            full_name: string; phone: string; address_line1: string; address_line2?: string;
            city: string; state: string; pincode: string; country?: string; is_default?: boolean;
        }) => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            if (address.id) {
                const { id, ...rest } = address;
                const { data, error } = await supabase
                    .from("addresses").update(rest).eq("id", id).eq("user_id", user.id).select().single();
                if (error) throw toError(error);
                return data;
            } else {
                const { data, error } = await supabase
                    .from("addresses").insert({ ...address, user_id: user.id }).select().single();
                if (error) throw toError(error);
                return data;
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-addresses"] }),
    });
}

export function useDeleteAddress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (addressId: string) => {
            const supabase = createClient();
            const { error } = await supabase.from("addresses").delete().eq("id", addressId);
            if (error) throw toError(error);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-addresses"] }),
    });
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useMyProfile() {
    return useQuery({
        queryKey: ["my-profile"],
        queryFn: async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .maybeSingle();

                // No profile row yet — auto-create it
                if (!data && !error) {
                    const { data: upserted } = await supabase
                        .from("profiles")
                        .upsert({ id: user.id, email: user.email }, { onConflict: "id" })
                        .select()
                        .maybeSingle();
                    // Return what we got, or a minimal fallback
                    return upserted ?? { id: user.id, email: user.email, name: null, phone: null };
                }

                if (error) {
                    // RLS blocking — return minimal object from auth user
                    return { id: user.id, email: user.email, name: null, phone: null };
                }

                return data;
            } catch {
                // Any other failure — return minimal object
                return { id: user.id, email: user.email, name: null, phone: null };
            }
        },
        retry: false,
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (updates: { full_name?: string; name?: string; phone?: string; avatar_url?: string }) => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // upsert always succeeds whether the row exists or not
            const payload: Record<string, any> = {
                id: user.id,
                email: user.email,
                name: updates.full_name ?? updates.name ?? null,
                phone: updates.phone ?? null,
            };
            if (updates.avatar_url !== undefined) {
                payload.avatar_url = updates.avatar_url;
            }

            const { data, error } = await supabase
                .from("profiles")
                .upsert(payload, { onConflict: "id" })
                .select()
                .maybeSingle(); // maybeSingle so RLS block doesn't throw

            if (error) throw toError(error);
            // Return data OR reconstruct from payload if RLS blocked the select
            return data ?? payload;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-profile"] }),
    });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export function useProductReviews(productId: string) {
    return useQuery({
        queryKey: ["reviews", productId],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("reviews")
                .select("*, profiles(name, avatar_url)")
                .eq("product_id", productId)
                .order("created_at", { ascending: false });

            if (error) throw toError(error);
            return data ?? [];
        },
        enabled: !!productId,
    });
}

export function useSubmitReview() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (review: { product_id: string; rating: number; review?: string }) => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("reviews")
                .upsert({ ...review, user_id: user.id })
                .select().single();

            if (error) throw toError(error);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["reviews", variables.product_id] });
        },
    });
}

// ─── Admin Hooks ──────────────────────────────────────────────────────────────

export function useAdminProducts() {
    return useQuery({
        queryKey: ["admin-products"],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("products")
                .select(`
                    *,
                    categories(name),
                    product_images(image_url, is_primary)
                `)
                .order("created_at", { ascending: false });

            if (error) throw toError(error);
            return data ?? [];
        },
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: { product: any; image_urls?: string[] }) => {
            const supabase = createClient();
            const { data, error } = await supabase.from("products").insert(payload.product).select().single();
            if (error) throw toError(error);

            if (payload.image_urls && payload.image_urls.length > 0) {
                const images = payload.image_urls.map((url, index) => ({
                    product_id: data.id,
                    image_url: url,
                    is_primary: index === 0
                }));
                const { error: imgErr } = await supabase.from("product_images").insert(images);
                if (imgErr) console.error("Image upload insertion error:", imgErr);
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates, image_urls }: { id: string; updates: any; image_urls?: string[] }) => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("products")
                .update(updates)
                .eq("id", id)
                .select()
                .single();
            if (error) throw toError(error);

            if (image_urls !== undefined) {
                // Wipe exising and replace
                await supabase.from("product_images").delete().eq("product_id", id);
                if (image_urls.length > 0) {
                    const images = image_urls.map((url, index) => ({
                        product_id: id,
                        image_url: url,
                        is_primary: index === 0
                    }));
                    const { error: imgErr } = await supabase.from("product_images").insert(images);
                    if (imgErr) console.error("Image upload insertion error:", imgErr);
                }
            }

            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
            queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const supabase = createClient();
            const { error } = await supabase.from("products").delete().eq("id", id);
            if (error) throw toError(error);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-products"] });
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
    });
}

export function useAdminOrders() {
    return useQuery({
        queryKey: ["admin-orders"],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("orders")
                .select(`
                    *,
                    profiles(name, email)
                `)
                .order("created_at", { ascending: false });

            if (error) throw toError(error);
            return data ?? [];
        },
    });
}

export function useUpdateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const supabase = createClient();
            const { data, error } = await supabase.from("orders").update(updates).eq("id", id).select().single();
            if (error) throw toError(error);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            queryClient.invalidateQueries({ queryKey: ["my-orders"] });
        },
    });
}

export function useAdminCustomers() {
    return useQuery({
        queryKey: ["admin-customers"],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("profiles")
                .select(`
                    *,
                    orders(count)
                `)
                .order("created_at", { ascending: false });

            if (error) throw toError(error);
            return data ?? [];
        },
    });
}

export function useDashboardStats() {
    return useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const supabase = createClient();

            // Total revenue
            const { data: orders } = await supabase
                .from("orders")
                .select("total_amount")
                .eq("payment_status", "completed");
            const totalRevenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);

            // Total orders
            const { count: totalOrders } = await supabase
                .from("orders")
                .select("*", { count: "exact", head: true });

            // Total customers
            const { count: totalCustomers } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true });

            // Active products
            const { count: activeProducts } = await supabase
                .from("products")
                .select("*", { count: "exact", head: true })
                .eq("is_active", true);

            // Recent orders
            const { data: recentOrders } = await supabase
                .from("orders")
                .select(`
                    id, order_number, total_amount, order_status, created_at,
                    profiles(name)
                `)
                .order("created_at", { ascending: false })
                .limit(5);

            return {
                totalRevenue,
                totalOrders: totalOrders ?? 0,
                totalCustomers: totalCustomers ?? 0,
                activeProducts: activeProducts ?? 0,
                recentOrders: recentOrders ?? [],
            };
        },
    });
}

export function useReportsStats() {
    return useQuery({
        queryKey: ["reports-stats"],
        queryFn: async () => {
            const supabase = createClient();

            // Total revenue and all completed orders for processing
            const { data: allOrders } = await supabase
                .from("orders")
                .select("total_amount, created_at, id")
                .eq("payment_status", "completed");

            const completedOrders = allOrders ?? [];
            const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
            const totalOrders = completedOrders.length;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            const { count: totalCustomers } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true });

            // Process monthly revenue (last 7 months)
            const monthlyRevenueMap: Record<string, number> = {};
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            // Initialize last 7 months with 0
            const now = new Date();
            const last7Months: string[] = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = months[d.getMonth()];
                monthlyRevenueMap[monthName] = 0;
                last7Months.push(monthName);
            }

            completedOrders.forEach(o => {
                const d = new Date(o.created_at);
                const monthName = months[d.getMonth()];
                if (monthlyRevenueMap[monthName] !== undefined) {
                    monthlyRevenueMap[monthName] += Number(o.total_amount);
                }
            });

            const monthly = last7Months.map(month => ({
                month,
                revenue: monthlyRevenueMap[month]
            }));

            // Process top products
            const { data: orderItems } = await supabase
                .from("order_items")
                .select("quantity, price, products(name)")

            const productStats: Record<string, { units: number, revenue: number }> = {};

            (orderItems ?? []).forEach((item: any) => {
                const name = item.products?.name ?? "Unknown Product";
                if (!productStats[name]) {
                    productStats[name] = { units: 0, revenue: 0 };
                }
                productStats[name].units += Number(item.quantity);
                productStats[name].revenue += Number(item.quantity) * Number(item.price);
            });

            const topProducts = Object.entries(productStats)
                .map(([name, stats]) => ({
                    name,
                    units: stats.units,
                    revenue: stats.revenue,
                    trend: "+0%" // Static placeholder as calculating trends needs complex historical data
                }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            return {
                summary: {
                    totalRevenue,
                    totalOrders,
                    totalCustomers: totalCustomers ?? 0,
                    avgOrderValue
                },
                monthly,
                topProducts
            };
        },
    });
}

export function useMediaLibrary() {
    return useQuery({
        queryKey: ["media-library"],
        queryFn: async () => {
            const supabase = createClient();

            // Fetch product images
            const { data: productImages } = await supabase
                .from("product_images")
                .select("id, image_url, created_at, products(name)");

            // Fetch category images
            const { data: categories } = await supabase
                .from("categories")
                .select("id, image_url, name")
                .not("image_url", "is", null);

            const mediaItems: any[] = [];

            (productImages ?? []).forEach((pi: any) => {
                if (pi.image_url) {
                    mediaItems.push({
                        id: `pi-${pi.id}`,
                        url: pi.image_url,
                        name: `${pi.products?.name ?? 'product'}-img`,
                        size: "Unknown size",
                        type: "product",
                        created_at: pi.created_at || new Date().toISOString()
                    });
                }
            });

            (categories ?? []).forEach((c: any) => {
                if (c.image_url) {
                    mediaItems.push({
                        id: `cat-${c.id}`,
                        url: c.image_url,
                        name: `${c.name}-cat`,
                        size: "Unknown size",
                        type: "category",
                        created_at: new Date().toISOString()
                    });
                }
            });

            // Return unique by URL just in case
            const uniqueMedia = Array.from(new Map(mediaItems.map(item => [item.url, item])).values());
            return uniqueMedia.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
    });
}

// ─── Coupons ──────────────────────────────────────────────────────────────────
export function useAdminCoupons() {
    return useQuery({
        queryKey: ["admin-coupons"],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
            if (error) throw toError(error);
            return data ?? [];
        }
    });
}

export function useCreateCoupon() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const supabase = createClient();
            const { data, error } = await supabase.from("coupons").insert(payload).select().single();
            if (error) throw toError(error);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] })
    });
}

export function useUpdateCoupon() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const supabase = createClient();
            const { data, error } = await supabase.from("coupons").update(updates).eq("id", id).select().single();
            if (error) throw toError(error);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] })
    });
}

export function useDeleteCoupon() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const supabase = createClient();
            const { error } = await supabase.from("coupons").delete().eq("id", id);
            if (error) throw toError(error);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-coupons"] })
    });
}

// ─── Shipping Zones ───────────────────────────────────────────────────────────
export function useAdminShippingZones() {
    return useQuery({
        queryKey: ["admin-shipping-zones"],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from("shipping_zones").select("*").order("created_at", { ascending: false });
            if (error) throw toError(error);
            return data ?? [];
        }
    });
}

export function useCreateShippingZone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const supabase = createClient();
            const { data, error } = await supabase.from("shipping_zones").insert(payload).select().single();
            if (error) throw toError(error);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-shipping-zones"] })
    });
}

export function useUpdateShippingZone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const supabase = createClient();
            const { data, error } = await supabase.from("shipping_zones").update(updates).eq("id", id).select().single();
            if (error) throw toError(error);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-shipping-zones"] })
    });
}

export function useDeleteShippingZone() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const supabase = createClient();
            const { error } = await supabase.from("shipping_zones").delete().eq("id", id);
            if (error) throw toError(error);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-shipping-zones"] })
    });
}

// ─── Blog Posts ──────────────────────────────────────────────────────────────
export function useAdminBlogPosts() {
    return useQuery({
        queryKey: ["admin-blog-posts"],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
            if (error) throw toError(error);
            return data ?? [];
        }
    });
}

export function useCreateBlogPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: any) => {
            const supabase = createClient();
            const { data, error } = await supabase.from("blog_posts").insert(payload).select().single();
            if (error) throw toError(error);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] })
    });
}

export function useUpdateBlogPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
            const supabase = createClient();
            const { data, error } = await supabase.from("blog_posts").update(updates).eq("id", id).select().single();
            if (error) throw toError(error);
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] })
    });
}

export function useDeleteBlogPost() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const supabase = createClient();
            const { error } = await supabase.from("blog_posts").delete().eq("id", id);
            if (error) throw toError(error);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] })
    });
}
