"use client";

import Link from "next/link";
import Image from "next/image";
import { use } from "react";
import {
    ArrowLeft, CheckCircle2, Package, Truck, MapPin,
    CreditCard, Loader2, Download, AlertCircle, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useOrder } from "@/hooks/useSupabase";

// ─── Status configuration ────────────────────────────────────────────────────
const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
    const currentIndex = STATUS_STEPS.indexOf(currentStatus);

    const steps = [
        { key: "confirmed", label: "Order Confirmed", icon: CheckCircle2 },
        { key: "processing", label: "Packing", icon: Package },
        { key: "shipped", label: "Shipped", icon: Truck },
        { key: "delivered", label: "Delivered", icon: MapPin },
    ];

    return (
        <div className="flex items-start justify-between gap-0 w-full">
            {steps.map((step, idx) => {
                const stepIndex = STATUS_STEPS.indexOf(step.key);
                const isDone = currentIndex >= stepIndex;
                const isActive = STATUS_STEPS.indexOf(currentStatus) === stepIndex;
                const Icon = step.icon;

                return (
                    <div key={step.key} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                        <div className="flex items-center w-full">
                            {idx > 0 && (
                                <div className={`flex-1 h-1 ${isDone ? "bg-primary" : "bg-border"} transition-colors`} />
                            )}
                            <div className={`relative flex items-center justify-center h-10 w-10 rounded-full shrink-0 shadow transition-colors ${isDone ? "bg-primary text-white" : "bg-muted text-muted-foreground border-2 border-border"} ${isActive ? "ring-4 ring-primary/20" : ""}`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`flex-1 h-1 ${STATUS_STEPS.indexOf(currentStatus) > stepIndex ? "bg-primary" : "bg-border"} transition-colors`} />
                            )}
                        </div>
                        <span className={`text-xs font-medium text-center px-1 ${isDone ? "text-primary" : "text-muted-foreground"}`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const m: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
        delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${m[status] ?? m.pending}`}>
            {status}
        </span>
    );
}

// ─── Invoice Generator ────────────────────────────────────────────────────────
function generateInvoiceHTML(order: any): string {
    const orderNumber = order.order_number ?? order.id.substring(0, 8).toUpperCase();
    const date = new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const addr = order.addresses;
    const items = order.order_items ?? [];
    const subtotal = items.reduce((s: number, i: any) => s + (Number(i.price) * Number(i.quantity)), 0);
    const shipping = subtotal > 1500 ? 0 : 99;
    const total = order.total_amount ?? subtotal + shipping;

    const itemRows = items.map((item: any) => `
        <tr>
            <td style="padding:12px 0;border-bottom:1px solid #e8f5e9;font-size:14px;">${item.products?.name ?? "Plant"}</td>
            <td style="padding:12px 0;border-bottom:1px solid #e8f5e9;text-align:center;font-size:14px;">${item.quantity}</td>
            <td style="padding:12px 0;border-bottom:1px solid #e8f5e9;text-align:right;font-size:14px;">₹${Number(item.price).toLocaleString("en-IN")}</td>
            <td style="padding:12px 0;border-bottom:1px solid #e8f5e9;text-align:right;font-size:14px;font-weight:600;">₹${(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}</td>
        </tr>`).join("");

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice – Travancore Gardens #${orderNumber}</title>
    <style>
        * { margin:0;padding:0;box-sizing:border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background:#fff; color:#1a1a1a; }
        .wrap { max-width:720px; margin:40px auto; padding:40px; border:1px solid #e8f5e9; border-radius:12px; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; padding-bottom:32px; border-bottom:2px solid #e8f5e9; }
        .brand-logo { display:flex; align-items:center; gap:10px; }
        .logo-leaf { width:40px;height:40px;background:#14532d;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:22px; }
        .brand-name { font-size:22px; font-weight:700; color:#14532d; letter-spacing:-0.5px; }
        .brand-sub { font-size:12px; color:#6b7280; margin-top:2px; }
        .invoice-meta { text-align:right; }
        .invoice-title { font-size:28px; font-weight:700; color:#14532d; letter-spacing:-1px; }
        .invoice-num { font-size:14px; color:#6b7280; margin-top:4px; }
        .invoice-date { font-size:13px; color:#6b7280; margin-top:2px; }
        .addresses { display:flex; gap:40px; margin-bottom:36px; }
        .addr-block { flex:1; }
        .addr-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#14532d; margin-bottom:8px; }
        .addr-text { font-size:13px; line-height:1.7; color:#374151; }
        table { width:100%; border-collapse:collapse; }
        th { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#6b7280; padding:0 0 12px; border-bottom:2px solid #e8f5e9; text-align:left; }
        th:nth-child(2) { text-align:center; }
        th:nth-child(3), th:nth-child(4) { text-align:right; }
        .totals { margin-top:8px; padding-top:20px; }
        .total-row { display:flex;justify-content:space-between; font-size:13px;color:#374151;margin-bottom:8px; }
        .total-final { display:flex;justify-content:space-between; font-size:16px;font-weight:700;color:#14532d;padding-top:14px;border-top:2px solid #14532d;margin-top:6px; }
        .footer { margin-top:48px;padding-top:24px;border-top:1px solid #e8f5e9;text-align:center; }
        .footer p { font-size:12px;color:#6b7280;line-height:1.7; }
        .status-chip { display:inline-block;background:#dcfce7;color:#166534;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px; }
        .payment-badge { margin-top:4px;font-size:12px;color:#6b7280; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="header">
            <div>
                <div class="brand-logo">
                    <div class="logo-leaf">🌿</div>
                    <div>
                        <div class="brand-name">Travancore Gardens</div>
                        <div class="brand-sub">Premium Indoor Plants</div>
                    </div>
                </div>
                <div style="margin-top:16px;font-size:12px;color:#6b7280;line-height:1.7;">
                    Kerala, India<br>
                    support@travancoregardens.com
                </div>
            </div>
            <div class="invoice-meta">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-num">#${orderNumber}</div>
                <div class="invoice-date">Date: ${date}</div>
                <div style="margin-top:8px;">
                    <span class="status-chip">${order.order_status ?? "Confirmed"}</span>
                </div>
                <div class="payment-badge">Payment: ${order.payment_method ?? "Online"}</div>
            </div>
        </div>

        <div class="addresses">
            <div class="addr-block">
                <div class="addr-label">Bill To / Ship To</div>
                <div class="addr-text">
                    <strong>${addr?.full_name ?? "Customer"}</strong><br>
                    ${addr?.address_line1 ?? ""}${addr?.address_line2 ? ", " + addr.address_line2 : ""}<br>
                    ${addr?.city ?? ""}${addr?.state ? ", " + addr.state : ""}<br>
                    Pincode: ${addr?.pincode ?? ""}<br>
                    ${addr?.phone ? "Ph: " + addr.phone : ""}
                </div>
            </div>
            <div class="addr-block" style="text-align:right;">
                <div class="addr-label">Order Info</div>
                <div class="addr-text">
                    Order #: ${orderNumber}<br>
                    Date: ${date}<br>
                    Status: ${order.order_status ?? "—"}<br>
                    Payment: ${order.payment_status ?? "—"}
                </div>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemRows}
            </tbody>
        </table>

        <div class="totals">
            <div class="total-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString("en-IN")}</span></div>
            <div class="total-row"><span>Shipping</span><span>${shipping === 0 ? "Free" : "₹" + shipping}</span></div>
            <div class="total-row"><span>Taxes</span><span>Inclusive</span></div>
            <div class="total-final"><span>Total Due</span><span>₹${Number(total).toLocaleString("en-IN")}</span></div>
        </div>

        <div class="footer">
            <p>
                Thank you for shopping with Travancore Gardens 🌿<br>
                All plants are lovingly packed with care. For support, reach us at support@travancoregardens.com<br>
                This is a computer-generated invoice and does not require a signature.
            </p>
        </div>
    </div>
</body>
</html>`;
}

function downloadInvoice(order: any) {
    const html = generateInvoiceHTML(order);
    const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `travancore-invoice-${order.order_number ?? order.id.substring(0, 8)}.html`;
    link.click();
    URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: order, isLoading, error } = useOrder(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container mx-auto px-4 py-24 text-center max-w-md">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
                <p className="text-muted-foreground mb-6">We couldn't find order <strong>{id}</strong>. It may not exist or you may not have access.</p>
                <Button asChild>
                    <Link href="/profile">Back to Profile</Link>
                </Button>
            </div>
        );
    }

    const items: any[] = order.order_items ?? [];
    const addr: any = order.addresses;
    const subtotal = items.reduce((s: number, i: any) => s + (Number(i.price) * Number(i.quantity)), 0);
    const shipping = subtotal > 1500 ? 0 : 99;
    const orderNumber = order.order_number ?? order.id.substring(0, 8).toUpperCase();

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl">
            {/* Back */}
            <Link href="/profile" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
            </Link>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold font-heading tracking-tight">Order #{orderNumber}</h1>
                        <StatusBadge status={order.order_status} />
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => downloadInvoice(order)}>
                        <Download className="h-4 w-4" /> Download Invoice
                    </Button>
                    {order.tracking_number && (
                        <Button className="gap-2">
                            <Truck className="h-4 w-4" /> Track Shipment
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Timeline */}
            {order.order_status !== "cancelled" && (
                <div className="bg-card border rounded-xl p-6 mb-6">
                    <h2 className="text-base font-bold mb-6 text-muted-foreground uppercase tracking-wide text-xs">Delivery Status</h2>
                    <StatusTimeline currentStatus={order.order_status} />
                    {order.tracking_number && (
                        <div className="mt-6 pt-4 border-t flex items-center gap-2 text-sm">
                            <Truck className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">Tracking ID:</span>
                            <span className="font-mono font-semibold text-primary">{order.tracking_number}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Items */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card border rounded-xl p-6">
                        <h2 className="text-lg font-bold mb-6">Order Items ({items.length})</h2>
                        <div className="space-y-6">
                            {items.map((item: any, idx: number) => {
                                const image = item.products?.product_images?.find((i: any) => i.is_primary)?.image_url
                                    ?? item.products?.product_images?.[0]?.image_url;
                                return (
                                    <div key={item.id ?? idx}>
                                        {idx > 0 && <Separator className="mb-6" />}
                                        <div className="flex gap-4">
                                            <div className="h-20 w-20 bg-muted rounded-xl shrink-0 border overflow-hidden relative">
                                                {image ? (
                                                    <Image src={image} alt={item.products?.name ?? "Plant"} fill className="object-cover" sizes="80px" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        <Leaf className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold">{item.products?.name ?? "Plant"}</p>
                                                <p className="text-sm text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                                                <div className="flex justify-between items-center mt-3">
                                                    <span className="text-sm text-muted-foreground">₹{Number(item.price).toLocaleString("en-IN")} each</span>
                                                    <span className="font-bold text-foreground">₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Summary + Address + Payment */}
                <div className="space-y-4">
                    {/* Price Breakdown */}
                    <div className="bg-card border rounded-xl p-6">
                        <h2 className="text-base font-bold mb-4">Order Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal ({items.length} item{items.length !== 1 ? "s" : ""})</span>
                                <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className={`font-medium ${shipping === 0 ? "text-primary" : ""}`}>
                                    {shipping === 0 ? "Free" : `₹${shipping}`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Taxes</span>
                                <span className="font-medium">Inclusive</span>
                            </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex justify-between items-center font-bold text-base">
                            <span>Total Paid</span>
                            <span className="text-primary">₹{Number(order.total_amount ?? subtotal + shipping).toLocaleString("en-IN")}</span>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {addr && (
                        <div className="bg-card border rounded-xl p-6">
                            <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" /> Shipping Address
                            </h2>
                            <div className="text-sm text-muted-foreground leading-relaxed">
                                <span className="font-semibold text-foreground block mb-1">{addr.full_name}</span>
                                {addr.address_line1}<br />
                                {addr.address_line2 && <>{addr.address_line2}<br /></>}
                                {addr.city}, {addr.state}<br />
                                Pincode: {addr.pincode}<br />
                                {addr.phone && <>Ph: {addr.phone}</>}
                            </div>
                        </div>
                    )}

                    {/* Payment Info */}
                    <div className="bg-card border rounded-xl p-6">
                        <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" /> Payment
                        </h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Method</span>
                                <span className="font-medium capitalize">{order.payment_method ?? "Online"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <span className={`font-semibold ${order.payment_status === "paid" ? "text-green-600" : "text-yellow-600"}`}>
                                    {order.payment_status ?? "Pending"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
