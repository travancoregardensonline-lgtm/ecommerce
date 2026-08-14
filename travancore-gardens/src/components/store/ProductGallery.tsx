"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
    images: string[];
    alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
    const [mainImage, setMainImage] = useState(images[0]);

    return (
        <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border/50">
                <Image
                    src={mainImage}
                    alt={alt}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>
            <div className="grid grid-cols-4 gap-4">
                {images.map((img, i) => (
                    <div
                        key={i}
                        onClick={() => setMainImage(img)}
                        className={`relative aspect-square rounded-lg overflow-hidden bg-muted border cursor-pointer hover:border-primary transition-colors ${mainImage === img ? 'border-primary ring-1 ring-primary' : ''}`}
                    >
                        <Image src={img} alt={`${alt} ${i}`} fill className="object-cover" />
                    </div>
                ))}
            </div>
        </div>
    );
}
