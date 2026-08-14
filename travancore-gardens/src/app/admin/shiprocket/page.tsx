"use client";

import { useState, useCallback } from "react";
import {
    Truck, Package, RefreshCw, Search, AlertCircle, CheckCircle2,
    MapPin, Loader2, ExternalLink, ClipboardList, FileText, Zap,
    X, ChevronRight, ChevronDown, Phone, Mail, Clock, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { useAdminOrders, useUpdateOrder } from "@/hooks/useSupabase";
import { toast } from "sonner";

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_STEPS = ["NEW", "READY TO SHIP", "SHIPPED", "IN TRANSIT", "DELIVERED"];

function getStepIndex(status: string) {
    const s = (status ?? "").toUpperCase();
    if (s.includes("DELIVER")) return 4;
    if (s.includes("TRANSIT")) return 3;
    if (s.includes("SHIP")) return 2;
    if (s.includes("READY") || s.includes("AWB")) return 1;
    return 0;
}

function StatusBadge({ status }: { status: string }) {
    const s = (status ?? "").toLowerCase();
    let cls = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    if (s.includes("deliver")) cls = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    else if (s.includes("transit") || s.includes("ship")) cls = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    else if (s.includes("pickup") || s.includes("ready")) cls = "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    else if (s.includes("cancel")) cls = "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    else if (s.includes("new")) cls = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${cls}`}>
            {status || "NEW"}
        </span>
    );
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────
function useShiprocketOrders(page = 1) {
    return useQuery({
        queryKey: ["shiprocket-orders", page],
        queryFn: async () => {
            const res = await fetch(`/api/shiprocket?type=orders&page=${page}`);
            if (!res.ok) throw new Error((await res.json()).error || "Failed");
            return res.json();
        },
        retry: 1,
        refetchInterval: 30000,
    });
}

// ─── Courier Selection Modal ──────────────────────────────────────────────────
function CourierModal({
    open,
    order,
    onClose,
    onAssigned,
}: {
    open: boolean;
    order: any;
    onClose: () => void;
    onAssigned: () => void;
}) {
    const [couriers, setCouriers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [assigning, setAssigning] = useState<number | null>(null);
    const [fetched, setFetched] = useState(false);

    const fetchCouriers = async () => {
        setLoading(true);
        try {
            const pincode = order.billing_pincode ?? "110001";
            const weight = order.weight ?? "0.5";
            const res = await fetch(`/api/shiprocket?type=couriers&pickup=695572&delivery=${pincode}&weight=${weight}`);
            const data = await res.json();
            const list = data?.data?.available_courier_companies ?? [];
            setCouriers(list);
            setFetched(true);
            if (list.length === 0) toast.info("No couriers available for this route");
        } catch (err: any) {
            toast.error("Failed to fetch couriers: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (courierId: number, courierName: string) => {
        setAssigning(courierId);
        try {
            const shipmentId = order.shipments?.[0]?.id;
            if (!shipmentId) throw new Error("No shipment ID found for this order");

            const res = await fetch("/api/shiprocket/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "generate_awb",
                    shipment_id: shipmentId,
                    courier_id: courierId,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(`AWB assigned via ${courierName}! AWB: ${data?.response?.data?.awb_code ?? "Generated"}`);
            onAssigned();
            onClose();
        } catch (err: any) {
            toast.error("AWB assignment failed: " + err.message);
        } finally {
            setAssigning(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" /> Assign AWB — Select Courier
                    </DialogTitle>
                    <DialogDescription>
                        Order <span className="font-mono font-bold">{order?.channel_order_id}</span> · To: {order?.billing_city}, {order?.billing_state} — {order?.billing_pincode}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {!fetched ? (
                        <div className="text-center py-8">
                            <Truck className="h-10 w-10 text-primary/40 mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm mb-4">Fetch available couriers for this delivery route</p>
                            <Button onClick={fetchCouriers} disabled={loading} className="gap-2">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                {loading ? "Checking serviceability..." : "Check Available Couriers"}
                            </Button>
                        </div>
                    ) : couriers.length === 0 ? (
                        <div className="text-center py-8">
                            <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                            <p className="font-semibold">No couriers available</p>
                            <p className="text-sm text-muted-foreground mt-1">Try again or assign manually in Shiprocket dashboard</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {couriers.map((c: any) => (
                                <div key={c.courier_company_id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border hover:border-primary/40 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm">{c.courier_name}</p>
                                            {c.cod === 1 && <span className="text-[10px] bg-green-100 text-green-700 rounded px-1.5 py-0.5 font-semibold">COD</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{c.estimated_delivery_days}d ETA</span>
                                            <span>₹{Math.round(c.rate)} shipping</span>
                                            {c.rating && <span>★ {c.rating}/5</span>}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="ml-3 shrink-0 gap-1"
                                        onClick={() => handleAssign(c.courier_company_id, c.courier_name)}
                                        disabled={assigning !== null}
                                    >
                                        {assigning === c.courier_company_id
                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                            : <Zap className="h-3 w-3" />
                                        }
                                        {assigning === c.courier_company_id ? "Assigning..." : "Assign"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── AWB Tracker ─────────────────────────────────────────────────────────────
function AWBTracker() {
    const [awb, setAwb] = useState("");
    const [tracking, setTracking] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleTrack = async () => {
        if (!awb.trim()) return;
        setLoading(true); setTracking(null);
        try {
            const res = await fetch(`/api/shiprocket/track?awb=${awb.trim()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setTracking(data);
        } catch (err: any) {
            toast.error("Tracking failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const activities: any[] = tracking?.tracking_data?.shipment_track_activities ?? [];
    const info = tracking?.tracking_data?.shipment_track?.[0];

    return (
        <div className="bg-card border rounded-xl p-6 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" /> Track by AWB
            </h2>
            <div className="flex gap-2">
                <Input placeholder="Enter AWB number..." value={awb} onChange={e => setAwb(e.target.value)} onKeyDown={e => e.key === "Enter" && handleTrack()} className="font-mono" />
                <Button onClick={handleTrack} disabled={loading || !awb.trim()} className="shrink-0">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
                </Button>
            </div>
            {info && (
                <div className="bg-muted/40 rounded-xl p-4 border space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "AWB", value: info.awb_code },
                            { label: "Status", value: <StatusBadge status={info.current_status ?? "—"} /> },
                            { label: "Courier", value: info.courier_name },
                            { label: "ETA", value: info.etd ?? "—" },
                        ].map(f => (
                            <div key={f.label}><p className="text-xs text-muted-foreground">{f.label}</p><div className="font-semibold text-sm mt-0.5">{f.value}</div></div>
                        ))}
                    </div>
                    {activities.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto border-t pt-3">
                            {activities.slice(0, 8).map((a: any, i: number) => (
                                <div key={i} className="flex gap-3 text-xs">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${i === 0 ? "bg-primary" : "bg-border"}`} />
                                    <div><p className="font-medium">{a.activity}</p><p className="text-muted-foreground">{a.date} — {a.location}</p></div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Order Row ────────────────────────────────────────────────────────────────
function OrderRow({ order, supaOrder, onRefresh }: { order: any; supaOrder: any; onRefresh: () => void }) {
    const [expanded, setExpanded] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);
    const [courierModal, setCourierModal] = useState(false);
    const shipment = order.shipments?.[0];
    const hasAWB = !!shipment?.awb;
    const stepIdx = getStepIndex(order.status ?? "NEW");

    const callAction = async (action: string, extra: object = {}) => {
        setBusy(action);
        try {
            const res = await fetch("/api/shiprocket/action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action,
                    shipment_id: shipment?.id,
                    shipment_ids: shipment?.id ? [shipment.id] : [],
                    order_id: order.id,
                    supabase_order_id: supaOrder?.id,
                    ...extra,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(`"${action}" completed!`);
            onRefresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setBusy(null);
        }
    };

    return (
        <>
            <tr className={`hover:bg-muted/20 transition-colors border-b ${expanded ? "bg-muted/10" : ""}`}>
                <td className="px-4 py-3">
                    <button onClick={() => setExpanded(e => !e)} className="text-muted-foreground hover:text-foreground">
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-primary text-xs">{order.channel_order_id ?? `SR-${order.id}`}</td>
                <td className="px-4 py-3">
                    <p className="font-medium text-sm">{order.billing_customer_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{order.billing_city}, {order.billing_state}</p>
                </td>
                <td className="px-4 py-3">
                    {hasAWB ? (
                        <span className="font-mono text-xs text-primary font-semibold">{shipment.awb}</span>
                    ) : (
                        <span className="text-xs text-muted-foreground italic">Not assigned</span>
                    )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{shipment?.courier ?? "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={order.status ?? "NEW"} /></td>
                <td className="px-4 py-3 font-semibold text-sm">₹{Number(order.total ?? 0).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                </td>
                <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                        {/* Step-aware action buttons */}
                        {!hasAWB && (
                            <Button size="sm" className="gap-1 text-xs h-7" onClick={() => setCourierModal(true)} disabled={busy !== null}>
                                <Zap className="h-3 w-3" /> Assign AWB
                            </Button>
                        )}
                        {hasAWB && stepIdx < 2 && (
                            <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => callAction("generate_pickup")} disabled={busy !== null}>
                                {busy === "generate_pickup" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Package className="h-3 w-3" />}
                                Schedule Pickup
                            </Button>
                        )}
                        {hasAWB && (
                            <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => callAction("generate_manifest")} disabled={busy !== null}>
                                {busy === "generate_manifest" ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                                Manifest
                            </Button>
                        )}
                        {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                            <Button
                                size="sm" variant="ghost"
                                className="gap-1 text-xs h-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => { if (confirm("Cancel this Shiprocket order?")) callAction("cancel"); }}
                                disabled={busy !== null}
                            >
                                <X className="h-3 w-3" /> Cancel
                            </Button>
                        )}
                    </div>
                </td>
            </tr>

            {/* ── Expanded Details Row ── */}
            {expanded && (
                <tr className="bg-muted/5 border-b">
                    <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Shipping Steps */}
                            <div className="md:col-span-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Fulfillment Steps</p>
                                <div className="flex items-start gap-0">
                                    {[
                                        { label: "Order Created", sub: "In Shiprocket", done: true },
                                        { label: "AWB Assigned", sub: shipment?.awb ? `AWB: ${shipment.awb}` : "Not yet", done: hasAWB },
                                        { label: "Pickup Scheduled", sub: shipment?.pickup_scheduled_date ?? "Not yet", done: stepIdx >= 2 },
                                        { label: "Manifested", sub: "Courier collected", done: stepIdx >= 2 },
                                        { label: "Shipped", sub: "Out for delivery", done: stepIdx >= 3 },
                                        { label: "Delivered", sub: "Complete!", done: stepIdx >= 4 },
                                    ].map((step, idx, arr) => (
                                        <div key={step.label} className="flex-1 flex flex-col items-center">
                                            <div className="flex items-center w-full">
                                                {idx > 0 && <div className={`flex-1 h-0.5 ${arr[idx - 1].done ? "bg-primary" : "bg-border"}`} />}
                                                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border-2 ${step.done ? "bg-primary border-primary text-white" : "bg-background border-border text-muted-foreground"}`}>
                                                    {step.done ? "✓" : idx + 1}
                                                </div>
                                                {idx < arr.length - 1 && <div className={`flex-1 h-0.5 ${step.done ? "bg-primary" : "bg-border"}`} />}
                                            </div>
                                            <p className={`text-[10px] font-semibold text-center mt-1.5 ${step.done ? "text-primary" : "text-muted-foreground"}`}>{step.label}</p>
                                            <p className="text-[9px] text-muted-foreground/70 text-center">{step.sub}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="space-y-3">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order Details</p>
                                <div className="space-y-1.5 text-xs">
                                    {[
                                        { label: "Shiprocket Order ID", value: order.id },
                                        { label: "Shipment ID", value: shipment?.id ?? "—" },
                                        { label: "AWB", value: shipment?.awb ?? "Not assigned" },
                                        { label: "Courier", value: shipment?.courier ?? "—" },
                                        { label: "Channel Order ID", value: order.channel_order_id },
                                        { label: "Customer Phone", value: order.billing_phone },
                                        { label: "Pin Code", value: order.billing_pincode },
                                        { label: "Payment", value: order.payment_method },
                                    ].map(d => (
                                        <div key={d.label} className="flex justify-between gap-2">
                                            <span className="text-muted-foreground">{d.label}</span>
                                            <span className="font-medium font-mono text-right">{d.value ?? "—"}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}

            {/* Courier Modal */}
            <CourierModal
                open={courierModal}
                order={order}
                onClose={() => setCourierModal(false)}
                onAssigned={onRefresh}
            />
        </>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminShiprocketPage() {
    const [page, setPage] = useState(1);
    const [orderSearch, setOrderSearch] = useState("");
    const { data: srData, isLoading, error, refetch, isFetching } = useShiprocketOrders(page);
    const { data: supaOrders = [] } = useAdminOrders();

    const srOrders: any[] = srData?.data ?? [];
    const totalPages = srData?.meta?.last_page ?? 1;

    const findSupaOrder = useCallback((srOrder: any) => {
        return (supaOrders as any[]).find(o =>
            srOrder.channel_order_id?.includes(o.id?.substring(0, 8).toUpperCase())
        );
    }, [supaOrders]);

    const filtered = srOrders.filter(o =>
        !orderSearch ||
        o.channel_order_id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.billing_customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.shipments?.[0]?.awb?.includes(orderSearch)
    );

    const pending = srOrders.filter((o: any) => !o.shipments?.[0]?.awb).length;
    const delivered = srOrders.filter((o: any) => (o.status ?? "").toUpperCase().includes("DELIVER")).length;
    const inTransit = srOrders.filter((o: any) => {
        const s = (o.status ?? "").toUpperCase();
        return s.includes("TRANSIT") || s.includes("SHIP");
    }).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
                        <Truck className="h-8 w-8 text-primary" /> Shiprocket
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage shipments · Assign AWB · Schedule pickups · Generate manifests</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
                        <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button className="gap-2" asChild>
                        <a href="https://app.shiprocket.in" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" /> Open Dashboard
                        </a>
                    </Button>
                </div>
            </div>

            {/* Workflow Guide */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">📦 Fulfillment Workflow</p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                    {[
                        { step: "1", label: "Order Created", desc: "Auto after payment" },
                        { step: "2", label: "Assign AWB", desc: "Select courier" },
                        { step: "3", label: "Schedule Pickup", desc: "Request courier collection" },
                        { step: "4", label: "Generate Manifest", desc: "Print handover doc" },
                        { step: "5", label: "Shipped", desc: "Courier picks up" },
                        { step: "6", label: "Delivered", desc: "Order complete" },
                    ].map((s, i, arr) => (
                        <div key={s.step} className="flex items-center gap-2">
                            <div className="flex flex-col items-center">
                                <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">{s.step}</div>
                                <p className="text-xs font-semibold mt-1 text-foreground whitespace-nowrap">{s.label}</p>
                                <p className="text-[10px] text-muted-foreground whitespace-nowrap">{s.desc}</p>
                            </div>
                            {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mb-4" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total Orders", value: srOrders.length, icon: ClipboardList, color: "text-primary" },
                    { label: "Delivered", value: delivered, icon: CheckCircle2, color: "text-green-600" },
                    { label: "In Transit", value: inTransit, icon: Truck, color: "text-blue-500" },
                    { label: "Pending AWB", value: pending, icon: AlertCircle, color: "text-yellow-500" },
                ].map(s => (
                    <div key={s.label} className="bg-card border rounded-xl p-4 flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <s.icon className={`h-5 w-5 ${s.color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* AWB Tracker */}
            <AWBTracker />

            {/* Orders Table */}
            <div className="bg-card border rounded-xl overflow-hidden">
                <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-center">
                    <h2 className="text-base font-bold flex-1">Shiprocket Orders</h2>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name, ID, AWB..." className="pl-9" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-48"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center p-8">
                        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
                        <p className="font-semibold text-destructive">Failed to connect to Shiprocket</p>
                        <p className="text-sm text-muted-foreground mt-1">{(error as Error).message}</p>
                        <Button variant="outline" className="mt-4 gap-2" onClick={() => refetch()}>
                            <RefreshCw className="h-4 w-4" /> Retry
                        </Button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center p-8">
                        <Package className="h-10 w-10 text-muted-foreground mb-3" />
                        <p className="font-semibold">No orders found</p>
                        <p className="text-sm text-muted-foreground mt-1">Orders appear here automatically after payment</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="w-8 px-4 py-3" />
                                    {["Channel Order ID", "Customer", "AWB", "Courier", "Status", "Amount", "Date", "Actions"].map(h => (
                                        <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((order: any) => (
                                    <OrderRow
                                        key={order.id}
                                        order={order}
                                        supaOrder={findSupaOrder(order)}
                                        onRefresh={refetch}
                                    />
                                ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t">
                                <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
