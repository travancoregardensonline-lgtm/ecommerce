"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
    defaultQuantity?: number;
    min?: number;
    max?: number;
    onChange?: (q: number) => void;
}

export function QuantitySelector({
    defaultQuantity = 1,
    min = 1,
    max,
    onChange,
}: QuantitySelectorProps) {
    const [quantity, setQuantity] = useState(defaultQuantity);

    const change = (q: number) => {
        setQuantity(q);
        onChange?.(q);
    };

    const decrease = () => change(Math.max(min, quantity - 1));
    const increase = () => change(max !== undefined ? Math.min(max, quantity + 1) : quantity + 1);

    return (
        <div className="flex items-center border rounded-xl h-11 sm:h-12 w-28 sm:w-32 border-input bg-background shrink-0 select-none">
            <button
                type="button"
                onClick={decrease}
                disabled={quantity <= min}
                aria-label="Decrease quantity"
                className="px-3.5 h-full hover:bg-muted text-muted-foreground transition-colors flex items-center justify-center disabled:opacity-40 active:scale-95 touch-manipulation"
            >
                <Minus className="h-4 w-4" />
            </button>
            <span className="flex-1 text-center font-bold text-sm sm:text-base text-foreground">
                {quantity}
            </span>
            <button
                type="button"
                onClick={increase}
                disabled={max !== undefined && quantity >= max}
                aria-label="Increase quantity"
                className="px-3.5 h-full hover:bg-muted text-muted-foreground transition-colors flex items-center justify-center disabled:opacity-40 active:scale-95 touch-manipulation"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}
