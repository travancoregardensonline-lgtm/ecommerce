"use client";

import { Search, MapPin, Package, CheckCircle2, Truck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type OrderResult = {
    id: string;
    order_number: string | null;
    order_status: string;
    created_at: string;
    tracking_number: string | null;
    courier_partner: string | null;
};

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [order, setOrder] = useState<OrderResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setOrder(null);

        const supabase = createClient();

        // Search by order_number or partial id
        const { data, error: err } = await supabase
            .from("orders")
            .select(`
                id, order_number, order_status, created_at, tracking_number, courier_partner,
                profiles!orders_user_id_fkey(email)
            `)
            .or(`order_number.ilike.%${orderId.trim()}%,id.eq.${orderId.trim().length === 36 ? orderId.trim() : "00000000-0000-0000-0000-000000000000"}`)
            .limit(1)
            .maybeSingle();

        setIsLoading(false);

        if (err || !data) {
            setError("Order not found. Please check your Order ID and try again.");
            return;
        }

        setOrder(data as OrderResult);
    };

    const currentStepIdx = order
        ? STATUS_STEPS.indexOf(order.order_status as any)
        : -1;

    const stepConfig = [
        { key: "pending", icon: CheckCircle2, label: "Order Placed", desc: "Your order has been received." },
        { key: "confirmed", icon: CheckCircle2, label: "Confirmed", desc: "Order confirmed and being prepared." },
        { key: "processing", icon: Package, label: "Packed", desc: "Plants securely packed for transit." },
        { key: "shipped", icon: Truck, label: "In Transit", desc: "With our courier partner." },
        { key: "delivered", icon: MapPin, label: "Delivered", desc: "Package delivered successfully." },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-4xl min-h-[70vh]">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight">Track Your Order</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Enter your Order ID to track the status of your shipment in real time.
                </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 sm:p-10 shadow-sm max-w-2xl mx-auto mb-12">
                <form className="space-y-6" onSubmit={handleTrack}>
                    <div className="space-y-2">
                        <Label htmlFor="orderId">Order ID</Label>
                        <Input
                            id="orderId"
                            placeholder="e.g. TG-1042"
                            value={orderId}
                            onChange={e => setOrderId(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">Find your Order ID in the confirmation email or in My Orders.</p>
                    </div>
                    <Button size="lg" className="w-full h-12 text-base" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                        {isLoading ? "Searching…" : "Track Order"}
                    </Button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg">
                        {error}
                    </div>
                )}
            </div>

            {order && (
                <div className="bg-card border rounded-2xl p-6 sm:p-10 shadow-sm max-w-2xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-8 border-b gap-4">
                        <div>
                            <h2 className="text-2xl font-bold">Order #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</h2>
                            <p className="text-muted-foreground mt-1">
                                Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                            {order.tracking_number && (
                                <p className="text-sm mt-1">
                                    Tracking: <span className="font-mono font-semibold">{order.tracking_number}</span>
                                    {order.courier_partner && ` via ${order.courier_partner}`}
                                </p>
                            )}
                        </div>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold capitalize ${order.order_status === "delivered" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                            order.order_status === "shipped" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                                order.order_status === "cancelled" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                                    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}>
                            {order.order_status}
                        </span>
                    </div>

                    {/* Timeline */}
                    <div className="relative pl-8 space-y-6 before:absolute before:inset-0 before:ml-[19px] before:h-full before:w-0.5 before:bg-border">
                        {stepConfig.map((step, idx) => {
                            const done = idx <= currentStepIdx;
                            const active = idx === currentStepIdx;
                            const Icon = step.icon;
                            return (
                                <div key={step.key} className="relative flex items-start gap-4">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 absolute left-[-2.5rem] shadow ${done ? (active ? "bg-blue-500 text-white" : "bg-primary text-white") : "bg-muted text-muted-foreground"
                                        }`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className={`p-4 rounded-lg border w-full ${done ? "border-primary/30 bg-primary/5" : "border-dashed opacity-50"}`}>
                                        <p className="font-semibold text-foreground">{step.label}</p>
                                        <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
