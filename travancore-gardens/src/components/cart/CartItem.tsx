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
    const itemTotal = item.price * item.quantity;

    return (
        <div className="flex flex-row gap-3 sm:gap-4 py-4 sm:py-6 border-b border-border/60 last:border-b-0 items-start">
            {/* Plant Image */}
            <Link
                href={`/product/${item.slug}`}
                className="relative h-20 w-20 sm:h-28 sm:w-28 flex-shrink-0 rounded-xl overflow-hidden bg-muted border border-border/50 group"
            >
                <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 80px, 112px"
                />
            </Link>

            {/* Plant Details */}
            <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                        <Link
                            href={`/product/${item.slug}`}
                            className="font-semibold text-xs sm:text-base text-foreground hover:text-primary transition-colors line-clamp-2 leading-tight"
                        >
                            {item.name}
                        </Link>
                        {item.variant && (
                            <p className="mt-0.5 text-[11px] sm:text-xs text-muted-foreground font-medium">
                                Variant: {item.variant}
                            </p>
                        )}
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                            ₹{item.price.toLocaleString("en-IN")} each
                        </p>
                    </div>

                    <div className="text-right shrink-0">
                        <p className="font-bold text-xs sm:text-base text-foreground">
                            ₹{itemTotal.toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>

                {/* Actions: Stepper + Remove */}
                <div className="flex items-center justify-between mt-3 gap-2">
                    {/* Compact Quantity Stepper */}
                    <div className="flex items-center border border-input rounded-lg h-8 sm:h-9 bg-background select-none">
                        <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-2.5 h-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors disabled:opacity-40 active:scale-95 touch-manipulation"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                        >
                            <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs sm:text-sm font-bold text-foreground">
                            {item.quantity}
                        </span>
                        <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 h-full flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors active:scale-95 touch-manipulation"
                            aria-label="Increase quantity"
                        >
                            <Plus className="h-3 w-3" />
                        </button>
                    </div>

                    {/* Delete button */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
                        onClick={() => onRemove(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                    >
                        <Trash2 className="h-3.5 w-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Remove</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
