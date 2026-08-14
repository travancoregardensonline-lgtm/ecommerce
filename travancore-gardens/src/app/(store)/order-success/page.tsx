"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Truck, ArrowRight, Download, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/hooks/useSupabase";
import { Suspense } from "react";

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
        .brand-name { font-size:22px; font-weight:700; color:#14532d; letter-spacing:-0.5px; }
        .brand-sub { font-size:12px; color:#6b7280; margin-top:2px; }
        .invoice-title { font-size:28px; font-weight:700; color:#14532d; letter-spacing:-1px; }
        .invoice-num { font-size:14px; color:#6b7280; margin-top:4px; }
        .addresses { display:flex; gap:40px; margin-bottom:36px; }
        .addr-block { flex:1; }
        .addr-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#14532d; margin-bottom:8px; }
        .addr-text { font-size:13px; line-height:1.7; color:#374151; }
        table { width:100%; border-collapse:collapse; }
        th { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#6b7280; padding:0 0 12px; border-bottom:2px solid #e8f5e9; text-align:left; }
        th:nth-child(2) { text-align:center; }
        th:nth-child(3), th:nth-child(4) { text-align:right; }
        .total-row { display:flex;justify-content:space-between; font-size:13px;color:#374151;margin-bottom:8px; }
        .total-final { display:flex;justify-content:space-between; font-size:16px;font-weight:700;color:#14532d;padding-top:14px;border-top:2px solid #14532d;margin-top:12px;padding-bottom:0; }
        .footer { margin-top:48px;padding-top:24px;border-top:1px solid #e8f5e9;text-align:center; font-size:12px;color:#6b7280;line-height:1.7; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="header">
            <div>
                <div class="brand-name">🌿 Travancore Gardens</div>
                <div class="brand-sub">Premium Indoor Plants · Kerala, India</div>
                <div style="margin-top:16px;font-size:12px;color:#6b7280;line-height:1.8;">
                    support@travancoregardens.com
                </div>
            </div>
            <div style="text-align:right;">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-num">#${orderNumber}</div>
                <div style="font-size:13px;color:#6b7280;margin-top:4px;">Date: ${date}</div>
            </div>
        </div>
        <div class="addresses">
            <div class="addr-block">
                <div class="addr-label">Ship To</div>
                <div class="addr-text">
                    <strong>${addr?.full_name ?? "Customer"}</strong><br>
                    ${addr?.address_line1 ?? ""}${addr?.address_line2 ? ", " + addr.address_line2 : ""}<br>
                    ${addr?.city ?? ""}${addr?.state ? ", " + addr.state : ""} – ${addr?.pincode ?? ""}
                    ${addr?.phone ? "<br>Ph: " + addr?.phone : ""}
                </div>
            </div>
            <div class="addr-block" style="text-align:right;">
                <div class="addr-label">Payment</div>
                <div class="addr-text">
                    Method: ${order.payment_method ?? "Online"}<br>
                    Status: ${order.payment_status ?? "Paid"}<br>
                    Order Status: ${order.order_status ?? "Confirmed"}
                </div>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Description</th><th>Qty</th><th>Unit Price</th><th>Total</th>
                </tr>
            </thead>
            <tbody>${itemRows}</tbody>
        </table>
        <div style="margin-top:20px;">
            <div class="total-row"><span>Subtotal</span><span>₹${subtotal.toLocaleString("en-IN")}</span></div>
            <div class="total-row"><span>Shipping</span><span>${shipping === 0 ? "Free" : "₹" + shipping}</span></div>
            <div class="total-row"><span>Taxes</span><span>Inclusive</span></div>
            <div class="total-final"><span>Total</span><span>₹${Number(total).toLocaleString("en-IN")}</span></div>
        </div>
        <div class="footer">
            Thank you for shopping with Travancore Gardens 🌿<br>
            For support: support@travancoregardens.com · This is a computer-generated invoice.
        </div>
    </div>
</body>
</html>`;
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order") ?? "";
    const { data: order, isLoading } = useOrder(orderId);

    const handleDownloadInvoice = () => {
        if (!order) return;
        const html = generateInvoiceHTML(order);
        const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `travancore-invoice-${order.order_number ?? order.id.substring(0, 8)}.html`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const displayNumber = order?.order_number ?? orderId.substring(0, 8).toUpperCase();

    const statuses = [
        { label: "Confirmed", icon: CheckCircle2, key: "confirmed" },
        { label: "Packing", icon: Package, key: "processing" },
        { label: "Shipped", icon: Truck, key: "shipped" },
        { label: "Delivered", icon: MapPin, key: "delivered" },
    ];

    const currentStatusIdx = ["pending", "confirmed", "processing", "shipped", "delivered"]
        .indexOf(order?.order_status ?? "confirmed");

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 max-w-2xl text-center">
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mx-auto mb-8">
                <CheckCircle2 className="h-14 w-14 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-heading mb-4 tracking-tight">Order Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-2">
                Thank you for your purchase. Your plants are being lovingly prepared for dispatch.
            </p>
            <p className="text-sm text-muted-foreground mb-10">
                A confirmation email has been sent to your registered email address.
            </p>

            <div className="bg-card border rounded-2xl p-6 text-left mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Order ID</p>
                        {isLoading
                            ? <div className="h-6 w-32 bg-muted animate-pulse rounded mt-1" />
                            : <p className="text-lg font-bold font-heading">#{displayNumber}</p>
                        }
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        {isLoading
                            ? <div className="h-6 w-24 bg-muted animate-pulse rounded mt-1 ml-auto" />
                            : <p className="font-bold text-primary text-lg">₹{Number(order?.total_amount ?? 0).toLocaleString("en-IN")}</p>
                        }
                    </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-start justify-between gap-0">
                    {statuses.map((step, idx) => {
                        const stepIdx = ["confirmed", "processing", "shipped", "delivered"].indexOf(step.key);
                        const isDone = currentStatusIdx - 1 >= stepIdx;
                        const isActive = currentStatusIdx - 1 === stepIdx;
                        const Icon = step.icon;
                        return (
                            <div key={step.key} className="flex-1 flex flex-col items-center gap-2">
                                <div className="flex items-center w-full">
                                    {idx > 0 && <div className={`flex-1 h-1 ${isDone ? "bg-primary" : "bg-border"}`} />}
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isDone || isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground border-2 border-border"}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    {idx < statuses.length - 1 && <div className={`flex-1 h-1 ${isDone && !isActive ? "bg-primary" : "bg-border"}`} />}
                                </div>
                                <span className={`text-xs font-medium text-center ${isDone || isActive ? "text-primary" : "text-muted-foreground"}`}>{step.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="gap-2" onClick={handleDownloadInvoice} disabled={isLoading || !order}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Download Invoice
                </Button>
                <Button asChild className="gap-2">
                    <Link href="/profile">
                        View My Orders <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="mt-10 pt-8 border-t">
                <p className="text-muted-foreground mb-4">Want to continue shopping?</p>
                <Link href="/shop" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                    Browse More Plants <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
