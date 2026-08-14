"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, ShoppingBag, Heart, LogOut, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { OrderCard } from "@/components/store/OrderCard";
import { AddressCard } from "@/components/store/AddressCard";
import { useAuthStore } from "@/store/authStore";
import { useMyProfile, useUpdateProfile, useMyOrders, useMyAddresses, useSaveAddress, useDeleteAddress } from "@/hooks/useSupabase";
import { authActions } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

type AddressForm = {
    id?: string; full_name: string; phone: string;
    address_line1: string; address_line2: string;
    city: string; state: string; pincode: string; is_default: boolean;
};

const emptyAddress: AddressForm = {
    full_name: "", phone: "", address_line1: "", address_line2: "",
    city: "", state: "", pincode: "", is_default: false,
};

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState("profile");
    const [addressModal, setAddressModal] = useState(false);
    const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);
    const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
    const [formInit, setFormInit] = useState(false);

    // ── Supabase data hooks ────────────────────────────────────────
    const { data: profile, isLoading: profileLoading } = useMyProfile();
    const { data: orders, isLoading: ordersLoading } = useMyOrders();
    const { data: addresses, isLoading: addressesLoading } = useMyAddresses();
    const updateProfile = useUpdateProfile();
    const saveAddress = useSaveAddress();
    const deleteAddress = useDeleteAddress();

    // Sync profile form once data loads
    if (profile && !formInit) {
        setProfileForm({ name: profile.name ?? "", phone: profile.phone ?? "" });
        setFormInit(true);
    }

    const initials = (() => {
        const name = profile?.name ?? user?.email ?? "?";
        return name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
    })();

    const handleSignOut = async () => {
        await authActions.signOut();
        router.push("/login");
        router.refresh();
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile.mutateAsync({ full_name: profileForm.name, phone: profileForm.phone });
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveAddress.mutateAsync(addressForm as Parameters<typeof saveAddress.mutateAsync>[0]);
        setAddressModal(false);
        setAddressForm(emptyAddress);
    };

    const handleDeleteAddress = async (id: string) => {
        await deleteAddress.mutateAsync(id);
    };

    const openEdit = (addr: AddressForm) => { setAddressForm(addr); setAddressModal(true); };
    const openAdd = () => { setAddressForm(emptyAddress); setAddressModal(true); };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">

                {/* ── Sidebar ──────────────────────────────────────── */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="bg-card border border-border/50 rounded-xl p-6 sticky top-24">
                        <div className="flex flex-col items-center mb-6">
                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary text-2xl font-bold">
                                {profileLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : initials}
                            </div>
                            <h2 className="text-xl font-bold text-center">
                                {profile?.name ?? user?.email?.split("@")[0] ?? "My Account"}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1 text-center truncate w-full text-center px-2">
                                {user?.email ?? profile?.phone ?? ""}
                            </p>
                        </div>

                        <Separator className="my-4" />

                        <nav className="space-y-1">
                            {[
                                { id: "profile", icon: User, label: "Personal Info" },
                                { id: "orders", icon: ShoppingBag, label: "My Orders" },
                                { id: "addresses", icon: MapPin, label: "Saved Addresses" },
                                { id: "wishlist", icon: Heart, label: "Wishlist" },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors text-sm font-medium ${activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                                >
                                    <tab.icon className="h-4 w-4 shrink-0" /> {tab.label}
                                </button>
                            ))}
                        </nav>

                        <Separator className="my-4" />

                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors text-sm font-medium text-destructive hover:bg-destructive/10"
                        >
                            <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                    </div>
                </aside>

                {/* ── Content ──────────────────────────────────────── */}
                <div className="flex-1 min-w-0">

                    {/* Personal Info */}
                    {activeTab === "profile" && (
                        <div className="bg-card border border-border/50 rounded-xl p-6 sm:p-8">
                            <h2 className="text-2xl font-bold font-heading mb-6">Personal Information</h2>
                            <form onSubmit={handleSaveProfile}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            value={profileForm.name}
                                            onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Email Address</Label>
                                        <Input type="email" value={user?.email ?? ""} disabled className="bg-muted" />
                                        <p className="text-xs text-muted-foreground">Email is linked to your account and cannot be changed here.</p>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Phone Number</Label>
                                        <Input
                                            type="tel"
                                            value={profileForm.phone}
                                            onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                                <Button className="mt-8" disabled={updateProfile.isPending}>
                                    {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {updateProfile.isPending ? "Saving…" : "Save Changes"}
                                </Button>
                                {updateProfile.isSuccess && (
                                    <p className="mt-3 text-sm text-green-600">Profile updated successfully!</p>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Orders */}
                    {activeTab === "orders" && (
                        <div className="bg-card border border-border/50 rounded-xl p-6 sm:p-8">
                            <h2 className="text-2xl font-bold font-heading mb-6">Order History</h2>
                            {ordersLoading ? (
                                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                            ) : !orders?.length ? (
                                <div className="text-center py-16">
                                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="font-semibold text-lg mb-1">No orders yet</h3>
                                    <p className="text-muted-foreground mb-4">Start shopping and your orders will appear here.</p>
                                    <Button asChild><a href="/shop">Shop Now</a></Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order: any) => (
                                        <OrderCard
                                            key={order.id}
                                            orderId={order.id}  // ← full UUID for routing
                                            displayId={order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                                            date={new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                            total={order.total_amount}
                                            status={order.order_status}
                                            items={(order.order_items ?? []).map((item: any) => ({
                                                name: item.products?.name ?? "Product",
                                                quantity: item.quantity,
                                                imageUrl: item.products?.product_images?.find((img: any) => img.is_primary)?.image_url
                                                    ?? item.products?.product_images?.[0]?.image_url
                                                    ?? "https://images.pexels.com/photos/6913087/pexels-photo-6913087.jpeg?auto=compress&cs=tinysrgb&w=150",
                                            }))}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Addresses */}
                    {activeTab === "addresses" && (
                        <div className="bg-card border border-border/50 rounded-xl p-6 sm:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-heading">Saved Addresses</h2>
                                <Button size="sm" onClick={openAdd} className="gap-1.5">
                                    <Plus className="h-4 w-4" /> Add New
                                </Button>
                            </div>
                            {addressesLoading ? (
                                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                            ) : !addresses?.length ? (
                                <div className="text-center py-16">
                                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                                    <h3 className="font-semibold text-lg mb-1">No addresses saved</h3>
                                    <p className="text-muted-foreground mb-4">Add a shipping address to speed up checkout.</p>
                                    <Button onClick={openAdd}>Add Address</Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {addresses.map((addr: any) => (
                                        <AddressCard
                                            key={addr.id}
                                            name={addr.full_name}
                                            line1={addr.address_line1}
                                            line2={addr.address_line2}
                                            city={addr.city}
                                            state={addr.state}
                                            pincode={addr.pincode}
                                            country={addr.country ?? "India"}
                                            phone={addr.phone}
                                            isDefault={addr.is_default}
                                            onEdit={() => openEdit({
                                                id: addr.id,
                                                full_name: addr.full_name, phone: addr.phone,
                                                address_line1: addr.address_line1, address_line2: addr.address_line2 ?? "",
                                                city: addr.city, state: addr.state, pincode: addr.pincode,
                                                is_default: addr.is_default,
                                            })}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Wishlist */}
                    {activeTab === "wishlist" && (
                        <div className="bg-card border border-border/50 rounded-xl p-6 sm:p-8 text-center py-20">
                            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
                            <p className="text-muted-foreground mb-4">Save your favourite plants to buy them later.</p>
                            <Button asChild><a href="/shop">Browse Plants</a></Button>
                        </div>
                    )}

                </div>
            </div>

            {/* ── Address Modal ─────────────────────────────────────────── */}
            <Dialog open={addressModal} onOpenChange={setAddressModal}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>{addressForm.id ? "Edit Address" : "Add New Address"}</DialogTitle>
                        <DialogDescription>Fill in your shipping address details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSaveAddress} className="space-y-4 py-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Full Name</Label>
                                <Input value={addressForm.full_name} onChange={e => setAddressForm(p => ({ ...p, full_name: e.target.value }))} required />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Phone</Label>
                                <Input type="tel" value={addressForm.phone} onChange={e => setAddressForm(p => ({ ...p, phone: e.target.value }))} required />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Address Line 1</Label>
                                <Input value={addressForm.address_line1} onChange={e => setAddressForm(p => ({ ...p, address_line1: e.target.value }))} required />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Address Line 2 (Optional)</Label>
                                <Input value={addressForm.address_line2} onChange={e => setAddressForm(p => ({ ...p, address_line2: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input value={addressForm.city} onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))} required />
                            </div>
                            <div className="space-y-2">
                                <Label>State</Label>
                                <Input value={addressForm.state} onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Pincode</Label>
                                <Input value={addressForm.pincode} onChange={e => setAddressForm(p => ({ ...p, pincode: e.target.value }))} required maxLength={6} />
                            </div>
                            <div className="space-y-2">
                                <Label>Country</Label>
                                <Input value="India" disabled className="bg-muted" />
                            </div>
                            <div className="flex items-center gap-2 sm:col-span-2">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={addressForm.is_default}
                                    onChange={e => setAddressForm(p => ({ ...p, is_default: e.target.checked }))}
                                    className="h-4 w-4 accent-primary"
                                />
                                <Label htmlFor="is_default" className="cursor-pointer font-normal">Set as default address</Label>
                            </div>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setAddressModal(false)}>Cancel</Button>
                            <Button type="submit" disabled={saveAddress.isPending}>
                                {saveAddress.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Address
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
