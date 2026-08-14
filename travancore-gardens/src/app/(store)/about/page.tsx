import Image from "next/image";
import { Leaf, ShieldCheck, Truck } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-5xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight">About Travancore Gardens</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Bringing the outside in. We believe that everyone deserves to experience the joy, calm, and beauty that plants bring to a space.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                        src="https://images.unsplash.com/photo-1466692476878-424526bf1639?auto=format&fit=crop&q=80&w=1000"
                        alt="Beautiful greenhouse interiors"
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <h2 className="text-3xl font-bold font-heading mb-6 tracking-tight">Our Story</h2>
                    <div className="space-y-6 text-foreground/80 leading-relaxed">
                        <p>
                            Founded in 2021, Travancore Gardens started with a simple mission: to make it easy for people across India to buy healthy, beautiful plants online.
                        </p>
                        <p>
                            What began as a small nursery in Kerala has now blossomed into a nationwide community of plant lovers. We source our plants directly from growers who share our commitment to quality and sustainability.
                        </p>
                        <p>
                            Unlike traditional nurseries, we acclimate our plants carefully before they reach your home, ensuring they thrive from day one. Our bespoke packaging guarantees that your new green friends arrive safely and stress-free.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-muted rounded-3xl p-8 md:p-16 mb-20">
                <h2 className="text-3xl font-bold font-heading mb-12 text-center tracking-tight">The Travancore Promise</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Leaf className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
                        <p className="text-muted-foreground">Every plant is hand-selected and carefully nurtured to ensure optimal health and beauty before shipping.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <Truck className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Safe Delivery</h3>
                        <p className="text-muted-foreground">Our innovative packaging keeps soil in the pot and leaves intact, guaranteeing a safe journey to your door.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Expert Support</h3>
                        <p className="text-muted-foreground">Our dedicated team of plant experts is always ready to assist you with care tips and troubleshooting.</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
