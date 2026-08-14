"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Plus, Percent, Calendar, Loader2 } from "lucide-react";
import { useAdminCoupons, useDeleteCoupon } from "@/hooks/useSupabase";
import { CouponModal } from "@/components/admin/CouponModal";

export default function CouponsPage() {
    const { data: coupons = [], isLoading } = useAdminCoupons();
    const deleteCoupon = useDeleteCoupon();

    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any | null>(null);

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        setEditingCoupon(null);
        setIsModalOpen(true);
    };

    const handleEdit = (c: any) => {
        setEditingCoupon(c);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, code: string) => {
        if (confirm(`Delete coupon ${code}?`)) {
            await deleteCoupon.mutateAsync(id);
        }
    };

    const activeCount = coupons.filter(c => c.is_active).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Coupons</h1>
                    <p className="text-muted-foreground mt-1">Manage discount codes and promotional offers.</p>
                </div>
                <Button className="gap-2 shrink-0" onClick={handleAdd}><Plus className="h-4 w-4" /> Create Coupon</Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Active Coupons", value: activeCount.toString(), icon: Tag, color: "text-primary" },
                    { label: "Total Created", value: coupons.length.toString(), icon: Percent, color: "text-blue-500" },
                    { label: "Avg Discount", value: coupons.length > 0 ? `${(coupons.reduce((sum, c) => sum + (c.discount_type === 'percentage' ? c.discount_value : 0), 0) / coupons.length).toFixed(1)}%` : "0%", icon: Calendar, color: "text-orange-500" },
                ].map(stat => (
                    <div key={stat.label} className="bg-card border rounded-xl p-5 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="flex gap-3">
                <Input placeholder="Search coupons..." className="max-w-sm bg-background" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="bg-card border rounded-xl overflow-hidden min-h-[300px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredCoupons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <Tag className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No coupons found</h3>
                        <Button className="mt-4" onClick={handleAdd}>Create First Coupon</Button>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                {["Code", "Type", "Discount", "Min Order", "Used / Limit", "Expiry", "Status", "Actions"].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCoupons.map((coupon: any) => (
                                <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-mono font-bold text-primary">{coupon.code}</td>
                                    <td className="px-4 py-3 text-muted-foreground capitalize">{coupon.discount_type}</td>
                                    <td className="px-4 py-3 font-semibold">
                                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">₹{coupon.min_order_value}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{coupon.usage_count || 0} / {coupon.usage_limit || '∞'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${coupon.is_active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500" : "bg-muted text-muted-foreground"}`}>
                                            {coupon.is_active ? "Active" : "Disabled"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleEdit(coupon)}>Edit</Button>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(coupon.id, coupon.code)}>Delete</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <CouponModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} coupon={editingCoupon} />
        </div>
    );
}
