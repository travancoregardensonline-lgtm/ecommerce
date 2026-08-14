"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface Variant {
    id: string;
    name: string;
    priceDelta?: number;
}

export interface VariantSelectorProps {
    title: string;
    variants: Variant[];
    defaultSelectedId?: string;
}

export function VariantSelector({ title, variants, defaultSelectedId }: VariantSelectorProps) {
    const [selectedId, setSelectedId] = useState(defaultSelectedId ?? variants[0]?.id);

    return (
        <div>
            <h3 className="text-sm font-medium text-foreground mb-3">{title}</h3>
            <div className="flex flex-wrap gap-3">
                {variants.map(variant => (
                    <Button
                        key={variant.id}
                        variant="outline"
                        onClick={() => setSelectedId(variant.id)}
                        className={
                            selectedId === variant.id
                                ? "border-primary text-primary bg-primary/5 hover:bg-primary/10 hover:text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        }
                    >
                        {variant.name} {variant.priceDelta ? `(+₹${variant.priceDelta})` : ''}
                    </Button>
                ))}
            </div>
        </div>
    );
}
