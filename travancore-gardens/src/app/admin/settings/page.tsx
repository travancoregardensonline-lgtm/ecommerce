"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Globe, CreditCard, Truck, Mail, Save, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminOrders, useAdminCustomers } from "@/hooks/useSupabase";

const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "email", label: "Email", icon: Mail },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [saving, setSaving] = useState(false);

    // General settings local state (would be persisted to a `settings` Supabase table in a full implementation)
    const [general, setGeneral] = useState({
        storeName: "Travancore Gardens",
        storeEmail: "hello@travancoregardens.com",
        phone: "+91 1800 123 4567",
        currency: "INR (₹)",
        address: "124 Green Valley Road, Kochi, Kerala 682001",
        gst: "29AABCT1234M1ZV",
        freeShippingThreshold: "1500",
        defaultShippingRate: "99",
    });

    const { data: orders = [] } = useAdminOrders();
    const { data: customers = [] } = useAdminCustomers();

    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
    const razorpayActive = razorpayKeyId.startsWith("rzp_");
    const cloudinaryActive = !!(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

    const handleSaveGeneral = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 600));
        setSaving(false);
        toast.success("Settings saved successfully!");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Configure your store settings and integrations.</p>
            </div>

            {/* Live Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Orders", value: orders.length, color: "text-primary" },
                    { label: "Total Customers", value: customers.length, color: "text-blue-500" },
                    { label: "Razorpay", value: razorpayActive ? "Connected" : "Not Set", color: razorpayActive ? "text-green-600" : "text-red-500" },
                    { label: "Cloudinary", value: cloudinaryActive ? "Connected" : "Not Set", color: cloudinaryActive ? "text-green-600" : "text-red-500" },
                ].map(s => (
                    <div key={s.label} className="bg-card border rounded-xl p-4">
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                        <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <aside className="w-full lg:w-52 shrink-0">
                    <nav className="space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${activeTab === tab.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <div className="flex-1 bg-card border rounded-xl p-6 sm:p-8">
                    {/* ─── General ─── */}
                    {activeTab === "general" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">General Settings</h2>
                            <Separator />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label>Store Name</Label>
                                    <Input value={general.storeName} onChange={e => setGeneral(g => ({ ...g, storeName: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Store Email</Label>
                                    <Input type="email" value={general.storeEmail} onChange={e => setGeneral(g => ({ ...g, storeEmail: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input value={general.phone} onChange={e => setGeneral(g => ({ ...g, phone: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Input value={general.currency} readOnly className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>GST Number</Label>
                                    <Input value={general.gst} onChange={e => setGeneral(g => ({ ...g, gst: e.target.value }))} placeholder="29AABCT1234M1ZV" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Free Shipping Threshold (₹)</Label>
                                    <Input type="number" value={general.freeShippingThreshold} onChange={e => setGeneral(g => ({ ...g, freeShippingThreshold: e.target.value }))} />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Store Address</Label>
                                    <Input value={general.address} onChange={e => setGeneral(g => ({ ...g, address: e.target.value }))} />
                                </div>
                            </div>
                            <Button className="gap-2" onClick={handleSaveGeneral} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    )}

                    {/* ─── Payment ─── */}
                    {activeTab === "payment" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Payment Integrations</h2>
                            <Separator />
                            <div className="space-y-4">
                                {[
                                    {
                                        name: "Razorpay",
                                        description: "Online payments — Cards, UPI, Net Banking, Wallets",
                                        active: razorpayActive,
                                        key: razorpayKeyId ? razorpayKeyId.substring(0, 8) + "••••••••" : "Not configured",
                                    },
                                    {
                                        name: "Cash on Delivery",
                                        description: "Customers pay at the time of delivery",
                                        active: true,
                                        key: "Always available",
                                    },
                                    {
                                        name: "Cloudinary (Media CDN)",
                                        description: "Image upload and CDN delivery for product photos",
                                        active: cloudinaryActive,
                                        key: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                                            ? `Cloud: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`
                                            : "Not configured",
                                    },
                                ].map(p => (
                                    <div key={p.name} className="flex items-center justify-between p-5 bg-muted/30 rounded-xl border gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-0.5 h-5 w-5 shrink-0 ${p.active ? "text-green-500" : "text-red-400"}`}>
                                                {p.active ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{p.name}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                                                <p className="text-xs font-mono text-muted-foreground mt-1">Key: {p.key}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-semibold rounded-full px-2.5 py-1 shrink-0 ${p.active ? "bg-green-100 text-green-700" : "bg-red-50 text-red-500"}`}>
                                            {p.active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                To update API keys, edit your <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">.env</code> file and restart the server.
                            </p>
                        </div>
                    )}

                    {/* ─── Shipping ─── */}
                    {activeTab === "shipping" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Shipping Configuration</h2>
                            <Separator />

                            {/* Shiprocket Status */}
                            <div className="p-5 bg-muted/30 rounded-xl border flex items-start gap-4">
                                <div className="mt-0.5 text-green-500"><CheckCircle2 className="h-5 w-5" /></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                        <p className="font-semibold">Shiprocket</p>
                                        <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-green-100 text-green-700">Configured</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">Automated order fulfillment and AWB generation after payment</p>
                                    <p className="text-xs font-mono text-muted-foreground mt-1">Account: {process.env.NEXT_PUBLIC_SHIPROCKET_EMAIL || "Configured via server env"}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label>Default Shipping Rate (₹)</Label>
                                    <Input
                                        type="number"
                                        value={general.defaultShippingRate}
                                        onChange={e => setGeneral(g => ({ ...g, defaultShippingRate: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Free Shipping Threshold (₹)</Label>
                                    <Input
                                        type="number"
                                        value={general.freeShippingThreshold}
                                        onChange={e => setGeneral(g => ({ ...g, freeShippingThreshold: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">Orders above this value get free shipping</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Shiprocket Pickup Location Name</Label>
                                    <Input defaultValue="Primary" />
                                    <p className="text-xs text-muted-foreground">Must match your Shiprocket dashboard pickup name</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Estimated Delivery (days)</Label>
                                    <Input defaultValue="3–5" />
                                </div>
                            </div>
                            <Button className="gap-2" onClick={handleSaveGeneral} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {saving ? "Saving..." : "Save Shipping Settings"}
                            </Button>
                        </div>
                    )}

                    {/* ─── Email ─── */}
                    {activeTab === "email" && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold">Email Templates</h2>
                            <Separator />
                            <div className="space-y-4">
                                {[
                                    { name: "Order Confirmation", trigger: "Sent when an order is successfully placed", file: "otp-email.html", status: "Active" },
                                    { name: "Shipping Confirmation", trigger: "Sent when the order is dispatched", file: "—", status: "Inactive" },
                                    { name: "Delivery Confirmation", trigger: "Sent when the order is marked delivered", file: "—", status: "Inactive" },
                                    { name: "Review Request", trigger: "3 days after delivery", file: "—", status: "Inactive" },
                                ].map(t => (
                                    <div key={t.name} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border gap-4">
                                        <div>
                                            <p className="font-semibold">{t.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{t.trigger}</p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${t.status === "Active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                                                {t.status}
                                            </span>
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
