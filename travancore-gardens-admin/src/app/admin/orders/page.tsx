"use client";

import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useAdminOrders, useUpdateOrder } from "@/hooks/useSupabase";
import { Loader2, Package } from "lucide-react";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

function StatusBadge({ status }: { status: string }) {
    let color = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    const s = status.toLowerCase();
    if (s === "delivered") color = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
    if (s === "processing" || s === "pending") color = "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500";
    if (s === "shipped") color = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500";
    if (s === "cancelled") color = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${color}`}>
            {status}
        </span>
    );
}

export default function AdminOrdersPage() {
    const { data: orders = [], isLoading } = useAdminOrders();
    const updateOrder = useUpdateOrder();
    const [search, setSearch] = useState("");

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await updateOrder.mutateAsync({ id: orderId, updates: { order_status: newStatus } });
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        }
    };

    const filteredOrders = orders.filter(o =>
        o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
        o.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
        o.profiles?.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Orders {orders.length > 0 && `(${orders.length})`}</h1>
                    <p className="text-muted-foreground mt-1">Manage and track customer orders here.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="shrink-0 gap-2">
                        <Download className="h-4 w-4" /> Export
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders by ID, Customer Name..."
                        className="pl-9 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="shrink-0 gap-2">
                    <Filter className="h-4 w-4" /> Filters
                </Button>
            </div>

            <div className="border rounded-md bg-background min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No orders yet</h3>
                        <p className="text-muted-foreground max-w-xs">Customer orders will appear here once they start shopping.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium text-primary hover:underline cursor-pointer">
                                        <Link href={`/admin/orders/${order.id}`}>
                                            {order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short", year: "numeric"
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{order.profiles?.name ?? "Guest User"}</div>
                                        <div className="text-xs text-muted-foreground">{order.profiles?.email}</div>
                                    </TableCell>
                                    <TableCell className="font-medium">₹{order.total_amount.toLocaleString("en-IN")}</TableCell>
                                    <TableCell>
                                        <Select
                                            defaultValue={order.order_status}
                                            onValueChange={(v) => handleStatusChange(order.id, v)}
                                            disabled={updateOrder.isPending}
                                        >
                                            <SelectTrigger className="h-8 w-[140px] text-xs font-semibold uppercase">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                                <SelectItem value="processing">Processing</SelectItem>
                                                <SelectItem value="shipped">Shipped</SelectItem>
                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/admin/orders/${order.id}`}>View</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
