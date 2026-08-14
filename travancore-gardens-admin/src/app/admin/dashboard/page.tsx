"use client";

import { useDashboardStats } from "@/hooks/useSupabase";
import { Loader2, Leaf, Package, HandCoins, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
    const { data: stats, isLoading } = useDashboardStats();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const { totalRevenue = 0, totalOrders = 0, totalCustomers = 0, activeProducts = 0, recentOrders = [] } = stats ?? {};

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground mt-2">Welcome back! Here&apos;s what&apos;s happening today.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Metric Cards */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                        <HandCoins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString("en-IN")}</div>
                        <p className="text-xs text-primary font-medium mt-1 flex items-center">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            +0% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Orders
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-primary font-medium mt-1 flex items-center">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            +0% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Customers
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCustomers}</div>
                        <p className="text-xs text-primary font-medium mt-1 flex items-center">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            +0% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Plants
                        </CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeProducts}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            live on shop
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px] flex items-center justify-center bg-muted/10 rounded-md border m-6 mt-0">
                        <p className="text-muted-foreground">Sales graph will appear here as more orders are placed.</p>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentOrders.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No orders yet.</p>
                            ) : (
                                recentOrders.map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{order.profiles?.name ?? order.profiles?.email ?? "Guest"}</p>
                                            <p className="text-sm text-muted-foreground text-xs">{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="font-bold">₹{order.total_amount.toLocaleString("en-IN")}</span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${order.order_status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500' :
                                                order.order_status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-500' :
                                                    order.order_status === 'shipped' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-500' :
                                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500'
                                                }`}>
                                                {order.order_status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
