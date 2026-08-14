import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CartItemType {
    id: string;
    productId: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string;
    quantity: number;
    variant?: string;
}

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (id: string, newQuantity: number) => void;
    onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 py-6 border-b border-border/50">
            <Link href={`/product/${item.slug}`} className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 96px, 128px"
                />
            </Link>
            <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                    <div>
                        <Link href={`/product/${item.slug}`} className="font-semibold hover:text-primary transition-colors line-clamp-2">
                            {item.name}
                        </Link>
                        {item.variant && (
                            <p className="mt-1 text-sm text-muted-foreground">{item.variant}</p>
                        )}
                    </div>
                    <p className="font-bold ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border rounded-md h-9">
                        <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-3 h-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-3 h-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
                            aria-label="Increase quantity"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onRemove(item.id)}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                    </Button>
                </div>
            </div>
        </div>
    );
}
