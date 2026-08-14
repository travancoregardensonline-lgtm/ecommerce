"use client";

import { Search, Filter, Download, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminOrders } from "@/hooks/useSupabase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useAdminCustomers } from "@/hooks/useSupabase";
import { Loader2, Users as UsersIcon } from "lucide-react";
import { useState } from "react";

export default function AdminCustomersPage() {
    const { data: customers = [], isLoading } = useAdminCustomers();
    const { data: allOrders = [] } = useAdminOrders();
    const [search, setSearch] = useState("");

    // Build a map of customer id -> order count
    const orderCountMap = allOrders.reduce((acc: Record<string, number>, order: any) => {
        if (order.user_id) {
            acc[order.user_id] = (acc[order.user_id] || 0) + 1;
        }
        return acc;
    }, {});

    // Build a map of customer id -> total spend
    const spendMap = allOrders.reduce((acc: Record<string, number>, order: any) => {
        if (order.user_id) {
            acc[order.user_id] = (acc[order.user_id] || 0) + Number(order.total_amount || 0);
        }
        return acc;
    }, {});

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    const handleExport = () => {
        if (customers.length === 0) return;
        let csv = "Name,Email,Phone,Total Orders,Total Spend (INR),Joined\n";
        customers.forEach((c: any) => {
            csv += `"${c.name || 'N/A'}",${c.email || 'N/A'},${c.phone || 'N/A'},${orderCountMap[c.id] || 0},${spendMap[c.id] || 0},${new Date(c.created_at).toLocaleDateString()}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Customers {customers.length > 0 && `(${customers.length})`}</h1>
                    <p className="text-muted-foreground mt-1">View and manage your customer database.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="shrink-0 gap-2" onClick={handleExport} disabled={customers.length === 0}>
                        <Download className="h-4 w-4" /> Export CSV
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers by name or email..."
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
                ) : customers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                        <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No customers yet</h3>
                        <p className="text-muted-foreground max-w-xs">Users who register or place guest orders will appear here.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Orders</TableHead>
                                <TableHead>Total Spend</TableHead>
                                <TableHead>Date Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.map((customer: any) => (
                                <TableRow key={customer.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {(customer.name ?? "U").split(" ").map((n: string) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="font-medium text-foreground">{customer.name ?? "Unnamed User"}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{customer.email}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{customer.phone || '—'}</TableCell>
                                    <TableCell className="font-medium">{orderCountMap[customer.id] || 0}</TableCell>
                                    <TableCell className="font-medium">₹{(spendMap[customer.id] || 0).toLocaleString('en-IN')}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(customer.created_at).toLocaleDateString("en-IN", {
                                            day: "numeric", month: "short", year: "numeric"
                                        })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
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
