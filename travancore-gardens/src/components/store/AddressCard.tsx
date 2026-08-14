import { Button } from "@/components/ui/button";

export interface AddressCardProps {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
    isDefault?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function AddressCard({
    name, line1, line2, city, state, pincode, country, phone, isDefault, onEdit, onDelete
}: AddressCardProps) {
    return (
        <div className={`border rounded-lg p-5 relative ${isDefault ? 'border-primary' : 'border-border'}`}>
            {isDefault && (
                <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                    Default
                </span>
            )}
            <p className="font-semibold text-sm mb-1">{name}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {line1}<br />
                {line2 && <>{line2}<br /></>}
                {city}, {state} {pincode}<br />
                {country}
            </p>
            <p className="text-sm mb-4">Phone: {phone}</p>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={onDelete}>Delete</Button>
            </div>
        </div>
    );
}
