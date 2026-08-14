"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Plus, MapPin, Clock, Loader2 } from "lucide-react";
import { useAdminShippingZones, useDeleteShippingZone } from "@/hooks/useSupabase";
import { ShippingModal } from "@/components/admin/ShippingModal";

export default function ShippingPage() {
    const { data: zones = [], isLoading } = useAdminShippingZones();
    // For free shipping threshold we can mock settings. Assuming store_settings API or just local state for simplicity right now.
    const [threshold, setThreshold] = useState("999");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<any | null>(null);

    const handleAdd = () => {
        setEditingZone(null);
        setIsModalOpen(true);
    };

    const handleEdit = (z: any) => {
        setEditingZone(z);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Shipping Configuration</h1>
                    <p className="text-muted-foreground mt-1">Manage shipping zones, rates, and courier settings.</p>
                </div>
                <Button className="gap-2 shrink-0" onClick={handleAdd}><Plus className="h-4 w-4" /> Add Zone</Button>
            </div>

            {/* Free Shipping Threshold */}
            <div className="bg-card border rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4">Free Shipping Threshold</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                    <div className="space-y-2 flex-1 max-w-xs">
                        <label className="text-sm font-medium">Minimum Order Amount (₹)</label>
                        <Input value={threshold} type="number" onChange={(e) => setThreshold(e.target.value)} />
                    </div>
                    <Button onClick={() => alert("Settings saved")}>Save</Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">Orders above this amount qualify for free standard shipping.</p>
            </div>

            {/* Shipping Zones */}
            <div className="bg-card border rounded-xl overflow-hidden min-h-[300px]">
                <div className="p-5 border-b flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold">Shipping Zones</h2>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-[200px]">
                        <Loader2 className="animate-spin text-primary h-8 w-8" />
                    </div>
                ) : zones.length === 0 ? (
                    <div className="flex justify-center flex-col items-center h-[200px] text-muted-foreground">
                        <MapPin className="h-8 w-8 mb-2" />
                        <p>No shipping zones created.</p>
                        <Button className="mt-2" variant="outline" onClick={handleAdd}>Setup Zone</Button>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                {["Zone", "Covered Areas", "Method", "Delivery Time", "Charge", "Actions"].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {zones.map((z: any) => (
                                <tr key={z.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-semibold">{z.zone_name}</td>
                                    <td className="px-4 py-3 text-muted-foreground text-xs">{z.coverage_info}</td>
                                    <td className="px-4 py-3">{z.shipping_method}</td>
                                    <td className="px-4 py-3 flex items-center gap-1 text-muted-foreground mt-1 mb-1"><Clock className="h-3 w-3" /> {z.delivery_time}</td>
                                    <td className="px-4 py-3 font-bold">₹{z.charge?.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(z)}>Edit</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Courier Partners */}
            <div className="bg-card border rounded-xl p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Truck className="h-5 w-5 text-primary" /> Courier Partners</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { name: "Delhivery", status: "Active", tracking: "Enabled" },
                        { name: "Shiprocket", status: "Active", tracking: "Enabled" },
                        { name: "BlueDart", status: "Inactive", tracking: "Disabled" },
                    ].map(c => (
                        <div key={c.name} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-semibold">{c.name}</p>
                                <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${c.status === "Active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{c.status}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Tracking: {c.tracking}</p>
                            <Button variant="outline" size="sm" className="mt-3 w-full">Configure</Button>
                        </div>
                    ))}
                </div>
            </div>

            <ShippingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} zone={editingZone} />
        </div>
    );
}
