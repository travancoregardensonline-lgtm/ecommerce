import { Star } from "lucide-react";

export function RatingStars({ rating, max = 5 }: { rating: number; max?: number }) {
    return (
        <div className="flex items-center text-amber-400">
            {Array.from({ length: max }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-current" : "text-muted-foreground/30 fill-muted-foreground/30"}`} />
            ))}
        </div>
    );
}
