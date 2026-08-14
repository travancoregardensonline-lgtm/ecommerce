"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Package, ArrowDown, Loader2 } from "lucide-react";
import { useAdminProducts, useUpdateProduct } from "@/hooks/useSupabase";

export default function InventoryPage() {
    const { data: products = [], isLoading } = useAdminProducts();
    const updateProduct = useUpdateProduct();
    const [search, setSearch] = useState("");

    // Simple state to track which product is being restocked
    const [editingStockId, setEditingStockId] = useState<string | null>(null);
    const [newStockValue, setNewStockValue] = useState<string>("");

    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    const inventory = filteredProducts.map((p: any) => {
        const stock = parseInt(p.stock) || 0;
        let status = "In Stock";
        if (stock === 0) status = "Out of Stock";
        else if (stock < 5) status = "Low Stock";

        return {
            id: p.id,
            name: p.name,
            sku: p.sku || "N/A",
            stock: stock,
            status
        };
    });

    const lowStock = inventory.filter(i => i.status === "Low Stock" || i.status === "Out of Stock").length;

    const handleUpdateStock = async (id: string) => {
        const val = parseInt(newStockValue);
        if (isNaN(val) || val < 0) {
            alert("Invalid stock value.");
            return;
        }

        try {
            await updateProduct.mutateAsync({ id, updates: { stock: val } });
            setEditingStockId(null);
            setNewStockValue("");
        } catch (error) {
            console.error(error);
            alert("Failed to update stock");
        }
    };

    const handleExport = () => {
        if (inventory.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Product Name,SKU,Stock,Status\n";

        inventory.forEach((item: any) => {
            const safeName = item.name.replace(/,/g, "");
            csvContent += `${safeName},${item.sku},${item.stock},${item.status}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `inventory_report_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Inventory</h1>
                    <p className="text-muted-foreground mt-1">Monitor stock levels and manage restocking.</p>
                </div>
                <Button variant="outline" className="gap-2 shrink-0" onClick={handleExport} disabled={inventory.length === 0}>
                    <ArrowDown className="h-4 w-4" /> Export CSV
                </Button>
            </div>

            {/* Alert Banner */}
            {lowStock > 0 && (
                <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                        {lowStock} product(s) are low on stock or out of stock. Consider restocking soon.
                    </p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Total Products", value: products.length, color: "text-primary" },
                    { label: "Low / Out of Stock", value: lowStock, color: "text-yellow-500" },
                    { label: "Total Units Available", value: inventory.reduce((s: number, i: any) => s + i.stock, 0), color: "text-blue-500" },
                ].map(stat => (
                    <div key={stat.label} className="bg-card border rounded-xl p-5">
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <Input
                placeholder="Search products..."
                className="max-w-sm"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <div className="bg-card border rounded-xl overflow-hidden min-h-[300px]">
                {inventory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No products found</h3>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                {["Product", "SKU", "Stock", "Status", "Actions"].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {inventory.map((item: any) => (
                                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.sku}</td>
                                    <td className="px-4 py-3 font-semibold">
                                        {editingStockId === item.id ? (
                                            <Input
                                                type="number"
                                                className="w-20 h-8"
                                                value={newStockValue}
                                                onChange={e => setNewStockValue(e.target.value)}
                                            />
                                        ) : (
                                            item.stock
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.status === 'In Stock' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                                                item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500' :
                                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {editingStockId === item.id ? (
                                            <div className="flex gap-2">
                                                <Button variant="default" size="sm" onClick={() => handleUpdateStock(item.id)}>Save</Button>
                                                <Button variant="ghost" size="sm" onClick={() => setEditingStockId(null)}>Cancel</Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingStockId(item.id);
                                                    setNewStockValue(item.stock.toString());
                                                }}
                                            >
                                                Update Stock
                                            </Button>
                                        )}
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
