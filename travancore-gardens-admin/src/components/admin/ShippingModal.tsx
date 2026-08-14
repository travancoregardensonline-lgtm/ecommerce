"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateShippingZone, useUpdateShippingZone } from "@/hooks/useSupabase";

export function ShippingModal({ isOpen, onClose, zone = null }: { isOpen: boolean; onClose: () => void; zone?: any | null }) {
    const createZone = useCreateShippingZone();
    const updateZone = useUpdateShippingZone();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        zone_name: "",
        coverage_info: "",
        shipping_method: "",
        delivery_time: "",
        charge: "",
        is_active: true
    });

    useEffect(() => {
        if (zone) {
            setFormData({
                zone_name: zone.zone_name || "",
                coverage_info: zone.coverage_info || "",
                shipping_method: zone.shipping_method || "Standard",
                delivery_time: zone.delivery_time || "",
                charge: zone.charge?.toString() || "",
                is_active: zone.is_active ?? true
            });
        } else {
            setFormData({ zone_name: "", coverage_info: "", shipping_method: "Standard", delivery_time: "", charge: "", is_active: true });
        }
    }, [zone, isOpen]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                zone_name: formData.zone_name,
                coverage_info: formData.coverage_info,
                shipping_method: formData.shipping_method,
                delivery_time: formData.delivery_time,
                charge: parseFloat(formData.charge) || 0,
                is_active: formData.is_active,
            };

            if (zone?.id) {
                await updateZone.mutateAsync({ id: zone.id, updates: payload });
            } else {
                await createZone.mutateAsync(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save shipping zone.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(o) => (!o && onClose())}>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{zone ? "Edit Zone" : "Add Shipping Zone"}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Zone Name (e.g., Metro Cities)</Label>
                        <Input value={formData.zone_name} onChange={e => setFormData({ ...formData, zone_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Coverage Info (Internal ref: cities/pincodes)</Label>
                        <Input value={formData.coverage_info} onChange={e => setFormData({ ...formData, coverage_info: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Shipping Method</Label>
                            <Input value={formData.shipping_method} onChange={e => setFormData({ ...formData, shipping_method: e.target.value })} placeholder="Express" />
                        </div>
                        <div className="space-y-2">
                            <Label>Delivery Time</Label>
                            <Input value={formData.delivery_time} onChange={e => setFormData({ ...formData, delivery_time: e.target.value })} placeholder="2-4 days" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Delivery Charge (₹)</Label>
                        <Input type="number" value={formData.charge} onChange={e => setFormData({ ...formData, charge: e.target.value })} placeholder="49.00" />
                    </div>

                    <label className="flex items-center gap-2 text-sm font-medium mt-4 cursor-pointer">
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="accent-primary w-4 h-4 cursor-pointer" />
                        Active Zone
                    </label>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading || !formData.zone_name}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Zone
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
