"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCoupon, useUpdateCoupon } from "@/hooks/useSupabase";

export function CouponModal({ isOpen, onClose, coupon = null }: { isOpen: boolean; onClose: () => void; coupon?: any | null }) {
    const createCoupon = useCreateCoupon();
    const updateCoupon = useUpdateCoupon();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_order_value: "",
        usage_limit: "",
        expiry_date: "",
        is_active: true
    });

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code || "",
                discount_type: coupon.discount_type || "percentage",
                discount_value: coupon.discount_value?.toString() || "",
                min_order_value: coupon.min_order_value?.toString() || "",
                usage_limit: coupon.usage_limit?.toString() || "",
                expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().split('T')[0] : "",
                is_active: coupon.is_active ?? true
            });
        } else {
            setFormData({ code: "", discount_type: "percentage", discount_value: "", min_order_value: "", usage_limit: "", expiry_date: "", is_active: true });
        }
    }, [coupon, isOpen]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                code: formData.code.toUpperCase(),
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value) || 0,
                min_order_value: parseFloat(formData.min_order_value) || 0,
                usage_limit: parseInt(formData.usage_limit) || null,
                expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
                is_active: formData.is_active,
            };

            if (coupon?.id) {
                await updateCoupon.mutateAsync({ id: coupon.id, updates: payload });
            } else {
                await createCoupon.mutateAsync(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save coupon.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(o) => (!o && onClose())}>
            <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>{coupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Coupon Code</Label>
                        <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Discount Type</Label>
                            <Select value={formData.discount_type} onValueChange={v => setFormData({ ...formData, discount_type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Discount Value</Label>
                            <Input type="number" value={formData.discount_value} onChange={e => setFormData({ ...formData, discount_value: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Min Order Value (₹)</Label>
                            <Input type="number" value={formData.min_order_value} onChange={e => setFormData({ ...formData, min_order_value: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Usage Limit</Label>
                            <Input type="number" placeholder="Unlimited" value={formData.usage_limit} onChange={e => setFormData({ ...formData, usage_limit: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input type="date" value={formData.expiry_date} onChange={e => setFormData({ ...formData, expiry_date: e.target.value })} />
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium mt-4 cursor-pointer">
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="accent-primary w-4 h-4 cursor-pointer" />
                        Active (Can be used by customers)
                    </label>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading || !formData.code || !formData.discount_value}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Coupon
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
