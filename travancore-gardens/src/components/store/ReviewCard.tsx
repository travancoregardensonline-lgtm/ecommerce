import { RatingStars } from "./RatingStars";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface ReviewCardProps {
    author: string;
    date: string;
    rating: number;
    content: string;
}

export function ReviewCard({ author, date, rating, content }: ReviewCardProps) {
    return (
        <div className="border rounded-xl p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {author.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold text-sm">{author}</p>
                        <p className="text-xs text-muted-foreground">{date}</p>
                    </div>
                </div>
                <RatingStars rating={rating} />
            </div>
            <p className="text-sm text-foreground leading-relaxed">{content}</p>
        </div>
    );
}
