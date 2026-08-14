"use client";

import { TrendingUp, ShoppingBag, Users, IndianRupee, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReportsStats } from "@/hooks/useSupabase";

export default function ReportsPage() {
    const { data, isLoading } = useReportsStats();

    const handleExport = () => {
        if (!data) return;

        let csvContent = "data:text/csv;charset=utf-8,";

        // Summary section
        csvContent += "=== SUMMARY ===\n";
        csvContent += `Total Revenue,${data.summary.totalRevenue}\n`;
        csvContent += `Total Orders,${data.summary.totalOrders}\n`;
        csvContent += `New Customers,${data.summary.totalCustomers}\n`;
        csvContent += `Avg Order Value,${data.summary.avgOrderValue}\n\n`;

        // Monthly section
        csvContent += "=== MONTHLY REVENUE ===\n";
        csvContent += "Month,Revenue\n";
        data.monthly?.forEach((m: any) => {
            csvContent += `${m.month},${m.revenue}\n`;
        });
        csvContent += "\n";

        // Top Products section
        csvContent += "=== TOP PRODUCTS ===\n";
        csvContent += "Product Name,Units Sold,Revenue\n";
        data.topProducts?.forEach((p: any) => {
            // Escape commas in names
            const safeName = p.name.replace(/,/g, "");
            csvContent += `${safeName},${p.units},${p.revenue}\n`;
        });

        // Trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `store_report_${new Date().toISOString().split("T")[0]}.csv`);
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

    const { summary, monthly = [], topProducts = [] } = data ?? {};
    const maxRevenue = Math.max(...monthly.map((m: any) => m.revenue), 1000); // 1000 as minimum scale

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Reports & Analytics</h1>
                    <p className="text-muted-foreground mt-1">Track your business performance and growth.</p>
                </div>
                <Button variant="outline" className="gap-2" onClick={handleExport} disabled={!data}>
                    <ArrowDown className="h-4 w-4" /> Export Report
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Revenue", value: `₹${(summary?.totalRevenue ?? 0).toLocaleString("en-IN")}`, icon: IndianRupee, trend: "+0%", color: "text-primary" },
                    { label: "Total Orders", value: (summary?.totalOrders ?? 0).toLocaleString("en-IN"), icon: ShoppingBag, trend: "+0%", color: "text-blue-500" },
                    { label: "New Customers", value: (summary?.totalCustomers ?? 0).toLocaleString("en-IN"), icon: Users, trend: "+0%", color: "text-purple-500" },
                    { label: "Avg. Order Value", value: `₹${(summary?.avgOrderValue ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`, icon: TrendingUp, trend: "+0%", color: "text-orange-500" },
                ].map(stat => (
                    <div key={stat.label} className="bg-card border rounded-xl p-5">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <div className={`h-9 w-9 rounded-full bg-muted flex items-center justify-center`}>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold font-heading">{stat.value}</p>
                        <p className="text-sm mt-1">
                            <span className={stat.trend.startsWith("+") ? "text-green-600" : "text-red-500"}>{stat.trend}</span>
                            <span className="text-muted-foreground"> vs last month</span>
                        </p>
                    </div>
                ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-card border rounded-xl p-6">
                <h2 className="text-lg font-bold mb-6">Monthly Revenue (Last 7 Months)</h2>
                {monthly.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">No recent order data found.</div>
                ) : (
                    <div className="flex items-end gap-3 h-48">
                        {monthly.map((m: any) => (
                            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-xs text-muted-foreground font-medium">₹{(m.revenue / 1000).toFixed(0)}k</span>
                                <div
                                    className="w-full rounded-t-lg bg-primary/80 hover:bg-primary transition-colors min-h-[4px]"
                                    style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                                />
                                <span className="text-xs text-muted-foreground">{m.month}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Top Products */}
            <div className="bg-card border rounded-xl overflow-hidden">
                <div className="p-5 border-b">
                    <h2 className="text-lg font-bold">Top Selling Products</h2>
                </div>
                {topProducts.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No products sold yet.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                {["Product", "Units Sold", "Revenue", "Trend"].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {topProducts.map((p: any) => (
                                <tr key={p.name} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">{p.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{p.units}</td>
                                    <td className="px-4 py-3 font-semibold">₹{p.revenue.toLocaleString("en-IN")}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-semibold ${p.trend.startsWith("+") ? "text-green-600" : "text-red-500"}`}>{p.trend}</span>
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
