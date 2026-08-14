"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Printer, Package, Truck, Loader2, CheckCircle2, Download } from "lucide-react";
import { useAdminOrders, useUpdateOrder } from "@/hooks/useSupabase";
import { toast } from "sonner";

function generatePackingSlip(order: any): string {
    const orderNumber = order.order_number ?? order.id.substring(0, 8).toUpperCase();
    const items = order.order_items ?? [];
    const addr = order.profiles;
    return `<!DOCTYPE html><html><head><title>Packing Slip – ${orderNumber}</title>
    <style>body{font-family:Arial,sans-serif;padding:32px;max-width:600px;margin:0 auto;}h1{font-size:20px;border-bottom:2px solid #000;padding-bottom:8px;}table{width:100%;border-collapse:collapse;margin-top:16px;}th,td{text-align:left;padding:8px;border-bottom:1px solid #ccc;}th{font-size:12px;text-transform:uppercase;color:#666;}.header{display:flex;justify-content:space-between;margin-bottom:24px;}</style></head>
    <body><div class="header"><div><strong>🌿 Travancore Gardens</strong><br>Kerala, India</div><div style="text-align:right"><strong>PACKING SLIP</strong><br>Order #${orderNumber}</div></div>
    <p><strong>Ship To:</strong> ${addr?.name ?? "Customer"}</p>
    <table><thead><tr><th>Product</th><th>Qty</th></tr></thead><tbody>
    ${items.map((i: any) => `<tr><td>${i.products?.name ?? "Plant"}</td><td>${i.quantity}</td></tr>`).join("")}
    </tbody></table></body></html>`;
}

export default function BulkOrdersPage() {
    const { data: orders = [], isLoading } = useAdminOrders();
    const updateOrder = useUpdateOrder();
    const [selected, setSelected] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredOrders = orders.filter((o: any) =>
        statusFilter === "all" ||
        o.order_status === statusFilter
    );

    const toggleAll = () => {
        setSelected(prev => prev.length === filteredOrders.length
            ? []
            : filteredOrders.map((o: any) => o.id)
        );
    };

    const toggle = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkStatusUpdate = async (newStatus: string) => {
        let successCount = 0;
        for (const id of selected) {
            try {
                await updateOrder.mutateAsync({ id, updates: { order_status: newStatus } });
                successCount++;
            } catch { /* continue */ }
        }
        toast.success(`${successCount} orders marked as ${newStatus}`);
        setSelected([]);
    };

    const handlePrintInvoices = () => {
        const selectedOrders = orders.filter((o: any) => selected.includes(o.id));
        selectedOrders.forEach((order: any) => {
            const orderNumber = order.order_number ?? order.id.substring(0, 8).toUpperCase();
            const items = order.order_items ?? [];
            const subtotal = items.reduce((s: number, i: any) => s + (Number(i.price) * Number(i.quantity)), 0);
            const html = `<!DOCTYPE html><html><head><title>Invoice ${orderNumber}</title>
            <style>body{font-family:Arial,sans-serif;padding:32px;max-width:720px;margin:0 auto;}h1{font-size:24px;color:#14532d;}table{width:100%;border-collapse:collapse;margin-top:16px;}th,td{text-align:left;padding:8px;border-bottom:1px solid #e8f5e9;}th{font-size:12px;text-transform:uppercase;color:#6b7280;}.total{font-weight:bold;font-size:16px;}</style></head>
            <body><h1>🌿 Travancore Gardens</h1><p>Invoice #${orderNumber} · Date: ${new Date(order.created_at).toLocaleDateString("en-IN")}</p>
            <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>
            ${items.map((i: any) => `<tr><td>${i.products?.name ?? "Plant"}</td><td>${i.quantity}</td><td>₹${Number(i.price).toLocaleString("en-IN")}</td><td>₹${(Number(i.price) * Number(i.quantity)).toLocaleString("en-IN")}</td></tr>`).join("")}
            </tbody></table><p class="total" style="margin-top:16px;">Total: ₹${Number(order.total_amount ?? subtotal).toLocaleString("en-IN")}</p></body></html>`;
            const blob = new Blob([html], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `invoice-${orderNumber}.html`; a.click();
            URL.revokeObjectURL(url);
        });
    };

    const handlePrintPackingSlips = () => {
        const selectedOrders = orders.filter((o: any) => selected.includes(o.id));
        selectedOrders.forEach((order: any) => {
            const html = generatePackingSlip(order);
            const blob = new Blob([html], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `packing-slip-${order.order_number ?? order.id.substring(0, 8)}.html`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };

    const statusColors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
        shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
        delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
        cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Bulk Order Processing</h1>
                    <p className="text-muted-foreground mt-1">Select multiple orders and take batch actions.</p>
                </div>
                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2">
                    {["all", "pending", "confirmed", "processing", "shipped", "delivered"].map(s => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setSelected([]); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${statusFilter === s ? "bg-primary text-white" : "bg-card border hover:bg-muted text-muted-foreground"}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selected.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <span className="font-semibold text-sm text-primary">{selected.length} order{selected.length > 1 ? "s" : ""} selected</span>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={handlePrintInvoices}>
                        <Printer className="h-4 w-4" /> Download Invoices
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={handlePrintPackingSlips}>
                        <Package className="h-4 w-4" /> Packing Slips
                    </Button>
                    <div className="flex gap-2 ml-auto">
                        <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("processing")} disabled={updateOrder.isPending}>
                            Mark Processing
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("shipped")} disabled={updateOrder.isPending}>
                            <Truck className="h-4 w-4 mr-1" /> Mark Shipped
                        </Button>
                        <Button size="sm" onClick={() => handleBulkStatusUpdate("delivered")} disabled={updateOrder.isPending}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Delivered
                        </Button>
                    </div>
                </div>
            )}

            <div className="bg-card border rounded-xl overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Package className="h-12 w-12 mb-4" />
                        <p className="font-medium">No orders found for this filter</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-border cursor-pointer accent-primary"
                                        checked={selected.length === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={toggleAll}
                                    />
                                </th>
                                {["Order ID", "Customer", "Items", "Amount", "Status", "Date", "Actions"].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredOrders.map((order: any) => (
                                <tr
                                    key={order.id}
                                    className={`hover:bg-muted/30 transition-colors ${selected.includes(order.id) ? "bg-primary/5" : ""}`}
                                >
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-border cursor-pointer accent-primary"
                                            checked={selected.includes(order.id)}
                                            onChange={() => toggle(order.id)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 font-mono font-bold text-primary text-xs">
                                        {order.order_number ?? order.id.substring(0, 8).toUpperCase()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{order.profiles?.name ?? "Guest User"}</div>
                                        <div className="text-xs text-muted-foreground">{order.profiles?.email}</div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {(order.order_items ?? []).length} item(s)
                                    </td>
                                    <td className="px-4 py-3 font-semibold">
                                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[order.order_status] ?? statusColors.pending}`}>
                                            {order.order_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">
                                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/orders`}>View</Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
