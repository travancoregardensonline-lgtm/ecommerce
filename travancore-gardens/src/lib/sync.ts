import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export async function syncCartAndWishlistOnLogin(userId: string) {
    const supabase = createClient();

    // ==========================================
    // 1. SYNC CART
    // ==========================================
    try {
        // Get or create cart
        let { data: cart } = await supabase.from("carts").select("id").eq("user_id", userId).single();
        if (!cart) {
            const { data: newCart } = await supabase.from("carts").insert({ user_id: userId }).select("id").single();
            cart = newCart;
        }

        if (cart) {
            const cartId = cart.id;
            useCartStore.getState().setCartId(cartId);
            const localItems = useCartStore.getState().items;
            
            // Fetch remote items
            const { data: remoteItems } = await supabase.from("cart_items")
                .select("*, products(*)")
                .eq("cart_id", cartId);

            // Create a map for quick lookup
            const remoteMap = new Map();
            if (remoteItems) {
                for (const r of remoteItems) {
                    remoteMap.set(r.product_id, r);
                }
            }

            // Push local items to remote if not exist or update quantity
            for (const localItem of localItems) {
                if (remoteMap.has(localItem.product_id)) {
                    // Update quantity (additive merge)
                    const existing = remoteMap.get(localItem.product_id);
                    const newQty = existing.quantity + localItem.quantity;
                    await supabase.from("cart_items").update({ quantity: newQty }).eq("id", existing.id);
                    existing.quantity = newQty; // update local map
                } else {
                    // Insert new
                    await supabase.from("cart_items").insert({
                        cart_id: cartId,
                        product_id: localItem.product_id,
                        quantity: localItem.quantity
                    });
                }
            }

            // Now fetch the final remote state to populate local store properly
            const { data: finalRemoteItems } = await supabase.from("cart_items")
                .select("*, products(*)")
                .eq("cart_id", cartId);

            if (finalRemoteItems) {
                const mergedCartItems = finalRemoteItems.map(r => ({
                    id: r.id, // we can use the cart_item id or product id
                    product_id: r.products.id,
                    name: r.products.name,
                    slug: r.products.slug,
                    price: r.products.price,
                    sale_price: r.products.sale_price,
                    image_url: r.products.images?.[0] ?? "",
                    quantity: r.quantity,
                    weight: r.products.weight ?? 0.5,
                }));
                // Override local cart with merged result
                useCartStore.setState({ items: mergedCartItems });
            }
        }
    } catch (e) {
        console.error("Cart sync failed", e);
    }

    // ==========================================
    // 2. SYNC WISHLIST
    // ==========================================
    try {
        // Get or create wishlist
        let { data: wishlist } = await supabase.from("wishlists").select("id").eq("user_id", userId).single();
        if (!wishlist) {
            const { data: newWishlist } = await supabase.from("wishlists").insert({ user_id: userId }).select("id").single();
            wishlist = newWishlist;
        }

        if (wishlist) {
            const wishlistId = wishlist.id;
            useWishlistStore.getState().setWishlistId(wishlistId);
            const localItems = useWishlistStore.getState().items;

            const { data: remoteItems } = await supabase.from("wishlist_items")
                .select("*, products(*)")
                .eq("wishlist_id", wishlistId);

            const remoteMap = new Map();
            if (remoteItems) {
                for (const r of remoteItems) {
                    remoteMap.set(r.product_id, r);
                }
            }

            for (const localItem of localItems) {
                if (!remoteMap.has(localItem.id)) {
                    await supabase.from("wishlist_items").insert({
                        wishlist_id: wishlistId,
                        product_id: localItem.id
                    });
                }
            }

            // Fetch final wishlist
            const { data: finalRemoteItems } = await supabase.from("wishlist_items")
                .select("*, products(*)")
                .eq("wishlist_id", wishlistId);

            if (finalRemoteItems) {
                const mergedWishlistItems = finalRemoteItems.map(r => r.products);
                useWishlistStore.setState({ items: mergedWishlistItems });
            }
        }
    } catch (e) {
        console.error("Wishlist sync failed", e);
    }
}
