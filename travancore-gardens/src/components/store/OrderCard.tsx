import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";

export interface OrderItem {
    name: string;
    quantity: number;
    imageUrl: string;
}

export interface OrderCardProps {
    orderId: string;      // Full UUID — used for routing
    displayId: string;    // Short friendly label — shown in UI
    date: string;
    total: number;
    status: string;
    items: OrderItem[];
}

export function OrderCard({ orderId, displayId, date, total, status, items }: OrderCardProps) {
    // Capitalise status for display
    const statusLabel = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "Pending";
    const isDelivered = statusLabel === "Delivered";
    const isProcessing = ["Processing", "Confirmed", "Shipped"].includes(statusLabel);

    return (
        <div className="border rounded-lg p-6 bg-card">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <div>
                    <p className="text-sm font-medium">Order #{displayId}</p>
                    <p className="text-xs text-muted-foreground">Placed on {date}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold">₹{total.toLocaleString('en-IN')}</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${isDelivered ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500' :
                            isProcessing ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                        {statusLabel}
                    </span>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-4">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-muted rounded-md relative overflow-hidden shrink-0">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="64px" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        {idx === 0 && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/profile/orders/${orderId}`}>View Details</Link>
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
