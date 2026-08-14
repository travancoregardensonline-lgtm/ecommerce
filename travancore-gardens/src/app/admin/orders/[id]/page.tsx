"use client";

import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Loader2, Package, MapPin, CreditCard,
    Truck, FileText, Phone, Mail, Calendar, Hash,
    CheckCircle2, Clock, AlertCircle, User, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUpdateOrder } from "@/hooks/useSupabase";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

// ─── Status config ────────────────────────────────────────────────────────────
const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLES: Record<string, string> = {
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

function StatusBadge({ status }: { status: string }) {
    const s = (status ?? "pending").toLowerCase();
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide ${STATUS_STYLES[s] ?? "bg-gray-100 text-gray-700"}`}>
            {status}
        </span>
    );
}

const TIMELINE_STEPS = [
    { key: "pending", label: "Order Placed", icon: Clock },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function OrderTimeline({ status }: { status: string }) {
    const currentIdx = TIMELINE_STEPS.findIndex(s => s.key === status?.toLowerCase());
    if (status?.toLowerCase() === "cancelled") {
        return (
            <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Order Cancelled</span>
            </div>
        );
    }
    return (
        <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {TIMELINE_STEPS.map((step, idx) => {
                const done = idx <= currentIdx;
                const active = idx === currentIdx;
                const Icon = step.icon;
                return (
                    <div key={step.key} className="flex-1 flex flex-col items-center min-w-[80px]">
                        <div className="flex items-center w-full">
                            {idx > 0 && <div className={`flex-1 h-0.5 ${TIMELINE_STEPS[idx - 1] && idx - 1 < currentIdx ? "bg-primary" : "bg-border"}`} />}
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${done ? "bg-primary border-primary text-white" : "bg-background border-border text-muted-foreground"} ${active ? "ring-2 ring-primary ring-offset-2" : ""}`}>
                                <Icon className="h-4 w-4" />
                            </div>
                            {idx < TIMELINE_STEPS.length - 1 && <div className={`flex-1 h-0.5 ${done && idx < currentIdx ? "bg-primary" : "bg-border"}`} />}
                        </div>
                        <p className={`text-[11px] font-semibold text-center mt-2 ${done ? "text-primary" : "text-muted-foreground"}`}>{step.label}</p>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
function useAdminOrder(id: string) {
    return useQuery({
        queryKey: ["admin-order", id],
        queryFn: async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("orders")
                .select(`
                    *,
                    profiles(name, email, phone),
                    addresses(full_name, phone, address_line1, address_line2, city, state, pincode, country),
                    order_items(
                        id, quantity, price,
                        products(name, sku, weight, product_images(image_url, is_primary))
                    ),
                    payments(transaction_id, payment_gateway, payment_status, amount, created_at)
                `)
                .eq("id", id)
                .maybeSingle();
            if (error) throw new Error(error.message);
            return data;
        },
        enabled: !!id,
    });
}

// ─── Invoice generator (reuse from customer) ─────────────────────────────────
function generateInvoice(order: any) {
    const items = order?.order_items ?? [];
    const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    const shipping = order?.shipping_cost ?? 0;
    const discount = order?.discount_amount ?? 0;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Invoice #${order?.order_number ?? order?.id?.slice(0, 8).toUpperCase()}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #2E5E3E; }
  .brand { color: #2E5E3E; font-size: 22px; font-weight: bold; }
  .badge { background: #2E5E3E; color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: bold; }
  h3 { color: #2E5E3E; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #f1f5f1; text-align: left; padding: 12px; font-size: 13px; }
  td { padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
  .total-row { font-weight: bold; font-size: 15px; background: #2E5E3E; color: white; }
  .total-row td { padding: 14px 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
  .info-box { background: #f8fcf8; border: 1px solid #e2ece2; border-radius: 8px; padding: 16px; }
  .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
  .value { font-size: 13px; font-weight: 500; margin-top: 2px; }
</style></head><body>
<div class="header">
  <div>
    <div class="brand">🌿 Travancore Gardens</div>
    <div style="font-size:12px;color:#666;margin-top:4px;">Premium Plants &amp; Accessories</div>
    <div style="font-size:12px;color:#666;">Kerala, India • orders@travancoregardens.in</div>
  </div>
  <div style="text-align:right">
    <div class="badge">TAX INVOICE</div>
    <div style="font-size:13px;margin-top:8px;color:#666;">#${order?.order_number ?? order?.id?.slice(0, 8).toUpperCase()}</div>
    <div style="font-size:12px;color:#999;">${new Date(order?.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
  </div>
</div>

<div class="grid">
  <div class="info-box">
    <h4 style="margin:0 0 12px;color:#2E5E3E;">Bill To</h4>
    <div class="value">${order?.addresses?.full_name ?? order?.profiles?.name ?? "Customer"}</div>
    <div style="font-size:12px;color:#666;margin-top:6px;line-height:1.6;">
      ${order?.addresses?.address_line1 ?? ""}<br>
      ${order?.addresses?.address_line2 ? order.addresses.address_line2 + "<br>" : ""}
      ${order?.addresses?.city ?? ""}, ${order?.addresses?.state ?? ""} - ${order?.addresses?.pincode ?? ""}<br>
      ${order?.addresses?.phone ?? order?.profiles?.phone ?? ""}
    </div>
  </div>
  <div class="info-box">
    <h4 style="margin:0 0 12px;color:#2E5E3E;">Order Info</h4>
    <div class="label">Order ID</div><div class="value">${order?.order_number ?? order?.id?.slice(0, 8).toUpperCase()}</div>
    <div class="label" style="margin-top:8px;">Payment</div><div class="value" style="color:#16a34a;">Paid · Razorpay</div>
    <div class="label" style="margin-top:8px;">Status</div><div class="value">${order?.order_status?.toUpperCase()}</div>
  </div>
</div>

<table>
  <thead><tr><th>Item</th><th>SKU</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
  <tbody>
    ${items.map((item: any) => `
    <tr>
      <td>${item.products?.name ?? "Product"}</td>
      <td style="color:#666">${item.products?.sku ?? "—"}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">₹${Number(item.price).toLocaleString("en-IN")}</td>
      <td style="text-align:right">₹${(Number(item.price) * item.quantity).toLocaleString("en-IN")}</td>
    </tr>`).join("")}
  </tbody>
  <tfoot>
    <tr><td colspan="4" style="text-align:right;color:#666">Subtotal</td><td style="text-align:right">₹${subtotal.toLocaleString("en-IN")}</td></tr>
    ${shipping > 0 ? `<tr><td colspan="4" style="text-align:right;color:#666">Shipping</td><td style="text-align:right">₹${shipping.toLocaleString("en-IN")}</td></tr>` : ""}
    ${discount > 0 ? `<tr><td colspan="4" style="text-align:right;color:#16a34a">Discount</td><td style="text-align:right;color:#16a34a">-₹${discount.toLocaleString("en-IN")}</td></tr>` : ""}
    <tr class="total-row"><td colspan="4" style="text-align:right">Total</td><td style="text-align:right">₹${Number(order?.total_amount).toLocaleString("en-IN")}</td></tr>
  </tfoot>
</table>

<div style="margin-top:32px;padding:16px;background:#f8fcf8;border-radius:8px;font-size:12px;color:#666;text-align:center;">
  Thank you for choosing Travancore Gardens! 🌿<br>
  For queries: orders@travancoregardens.in | Returns: within 7 days of delivery
</div>
</body></html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); win.print(); }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminOrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const { data: order, isLoading, error, refetch } = useAdminOrder(id);
    const updateOrder = useUpdateOrder();

    const handleStatusChange = async (newStatus: string) => {
        try {
            await updateOrder.mutateAsync({ id, updates: { order_status: newStatus } });
            toast.success(`Order status updated to "${newStatus}"`);
            refetch();
        } catch {
            toast.error("Failed to update status");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-6">Order ID: <code className="bg-muted px-2 py-0.5 rounded">{id}</code></p>
                <Button onClick={() => router.back()}>← Back to Orders</Button>
            </div>
        );
    }

    const items = order.order_items ?? [];
    const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    const payment = order.payments?.[0];
    const address = order.addresses;
    const displayId = order.order_number ?? order.id.slice(0, 8).toUpperCase();

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-heading">Order #{displayId}</h1>
                            <StatusBadge status={order.order_status} />
                        </div>
                        <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" className="gap-2" onClick={() => generateInvoice(order)}>
                        <FileText className="h-4 w-4" /> Invoice
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Button asChild className="gap-2">
                        <Link href="/admin/shiprocket">
                            <Truck className="h-4 w-4" /> Shiprocket
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-card border rounded-xl p-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">Order Status</h2>
                <OrderTimeline status={order.order_status} />
                <Separator className="my-4" />
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium">Update Status:</span>
                    <Select defaultValue={order.order_status} onValueChange={handleStatusChange} disabled={updateOrder.isPending}>
                        <SelectTrigger className="w-[180px] h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {ORDER_STATUSES.map(s => (
                                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {updateOrder.isPending && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left — Items + Summary */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Items */}
                    <div className="bg-card border rounded-xl p-6">
                        <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                            <Package className="h-4 w-4 text-primary" /> Order Items ({items.length})
                        </h2>
                        <div className="space-y-4">
                            {items.map((item: any) => {
                                const img = item.products?.product_images?.find((i: any) => i.is_primary)?.image_url
                                    ?? item.products?.product_images?.[0]?.image_url;
                                return (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                                            {img && <Image src={img} alt={item.products?.name} fill className="object-cover" sizes="64px" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.products?.name ?? "Product"}</p>
                                            <p className="text-xs text-muted-foreground">SKU: {item.products?.sku ?? "—"} · Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-semibold text-sm">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                                            <p className="text-xs text-muted-foreground">₹{Number(item.price).toLocaleString("en-IN")} each</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span>
                            </div>
                            {(order.shipping_cost ?? 0) > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Shipping</span><span>₹{Number(order.shipping_cost).toLocaleString("en-IN")}</span>
                                </div>
                            )}
                            {(order.discount_amount ?? 0) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                                    <span>-₹{Number(order.discount_amount).toLocaleString("en-IN")}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span><span>₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    {order.tracking_number && (
                        <div className="bg-card border rounded-xl p-6">
                            <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                                <Truck className="h-4 w-4 text-primary" /> Shipping
                            </h2>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    { label: "AWB / Tracking", value: order.tracking_number },
                                    { label: "Shipment ID", value: order.shiprocket_shipment_id ?? "—" },
                                ].map(f => (
                                    <div key={f.label}>
                                        <p className="text-xs text-muted-foreground">{f.label}</p>
                                        <p className="font-mono font-semibold mt-0.5">{f.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right — Customer + Payment */}
                <div className="space-y-4">
                    {/* Customer */}
                    <div className="bg-card border rounded-xl p-5">
                        <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                            <User className="h-4 w-4" /> Customer
                        </h2>
                        <div className="space-y-2">
                            <p className="font-semibold">{order.profiles?.name ?? "Guest"}</p>
                            {order.profiles?.email && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5" /> {order.profiles.email}
                                </p>
                            )}
                            {order.profiles?.phone && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5" /> {order.profiles.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-card border rounded-xl p-5">
                        <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                            <MapPin className="h-4 w-4" /> Delivery Address
                        </h2>
                        {address ? (
                            <div className="text-sm space-y-0.5">
                                <p className="font-semibold">{address.full_name}</p>
                                {address.phone && <p className="text-muted-foreground flex items-center gap-1.5"><Phone className="h-3 w-3" />{address.phone}</p>}
                                <p className="text-muted-foreground mt-2 leading-relaxed">
                                    {address.address_line1}<br />
                                    {address.address_line2 && <>{address.address_line2}<br /></>}
                                    {address.city}, {address.state} – {address.pincode}<br />
                                    {address.country ?? "India"}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No address on file</p>
                        )}
                    </div>

                    {/* Payment */}
                    <div className="bg-card border rounded-xl p-5">
                        <h2 className="font-bold text-sm mb-3 flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
                            <CreditCard className="h-4 w-4" /> Payment
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span className={`font-semibold ${payment?.payment_status === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                                    {payment?.payment_status?.toUpperCase() ?? order.payment_status?.toUpperCase() ?? "—"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Gateway</span>
                                <span className="font-medium capitalize">{payment?.payment_gateway ?? "—"}</span>
                            </div>
                            {payment?.transaction_id && (
                                <div className="pt-2 border-t">
                                    <p className="text-xs text-muted-foreground">Transaction ID</p>
                                    <p className="font-mono text-xs mt-0.5 break-all">{payment.transaction_id}</p>
                                </div>
                            )}
                            {payment?.created_at && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Date</span>
                                    <span className="text-xs">{new Date(payment.created_at).toLocaleDateString("en-IN")}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Internal IDs */}
                    <div className="bg-muted/30 border rounded-xl p-4">
                        <h2 className="font-bold text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <Hash className="h-3.5 w-3.5" /> Internal References
                        </h2>
                        <div className="text-xs space-y-1.5 font-mono">
                            <div><span className="text-muted-foreground">Order ID: </span>{order.id}</div>
                            {order.shiprocket_order_id && <div><span className="text-muted-foreground">SR Order: </span>{order.shiprocket_order_id}</div>}
                            {order.shiprocket_shipment_id && <div><span className="text-muted-foreground">SR Shipment: </span>{order.shiprocket_shipment_id}</div>}
                            {order.tracking_number && <div><span className="text-muted-foreground">AWB: </span>{order.tracking_number}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
