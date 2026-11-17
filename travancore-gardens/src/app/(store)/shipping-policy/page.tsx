import { Truck, PackageCheck, MapPin, ShieldCheck, Clock, HelpCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const metadata = {
    title: "Shipping & Delivery Policy | Travancore Gardens",
    description: "Detailed information on shipping rates, delivery timelines, carrier partners, and live plant packaging across India.",
};

export default function ShippingPolicyPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-primary uppercase tracking-wide">Razorpay Compliance</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-3 text-foreground">
                    Shipping &amp; Delivery Policy
                </h1>
                <p className="text-muted-foreground text-sm">
                    Last updated: <strong>November 2026</strong>
                </p>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                    At <strong>Travancore Gardens</strong>, we take extreme pride in packaging living plants safely and dispatching them with premium logistics partners to ensure they reach your doorstep fresh, hydrated, and intact.
                </p>
            </div>

            <Separator className="mb-10" />

            {/* Sections */}
            <div className="space-y-10 text-foreground">
                {/* 1. Serviceable Areas */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary shrink-0" />
                        <h2 className="text-xl font-bold font-heading">1. Delivery Coverage (Pan-India)</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        We deliver to over <strong>26,000+ pin codes</strong> across India through our logistics integration with <strong>Shiprocket</strong> and top tier courier partners including Blue Dart, Delhivery, DTDC, and Xpressbees.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        <em>Please note:</em> We currently only ship within the Republic of India. We do not support international shipments at this time.
                    </p>
                </section>

                {/* 2. Processing & Dispatch Timelines */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary shrink-0" />
                        <h2 className="text-xl font-bold font-heading">2. Order Processing &amp; Dispatch Timeline</h2>
                    </div>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li>
                            <strong>Processing Time:</strong> Every plant is individually inspected for health, watered, conditioned, and custom-crated. Orders are processed and dispatched within <strong>24 to 48 hours</strong> (1–2 business days) of receiving payment.
                        </li>
                        <li>
                            <strong>Weekend &amp; Holiday Protection:</strong> To ensure plants do not spend prolonged weekends in courier warehouses, orders placed on Saturday afternoon or Sunday may be dispatched on Monday morning.
                        </li>
                        <li>
                            Orders placed on public holidays will be dispatched on the next operational business day.
                        </li>
                    </ul>
                </section>

                {/* 3. Estimated Delivery Timelines */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <PackageCheck className="h-5 w-5 text-primary shrink-0" />
                        <h2 className="text-xl font-bold font-heading">3. Estimated Delivery Times</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        Once dispatched from our warehouse in Thiruvananthapuram, Kerala, the delivery timelines are typically:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div className="border rounded-xl p-4 bg-muted/20">
                            <p className="font-semibold text-sm text-foreground">Kerala &amp; South India</p>
                            <p className="text-2xl font-bold text-primary mt-1">2 – 3 Days</p>
                            <p className="text-xs text-muted-foreground mt-1">Fast express transit</p>
                        </div>
                        <div className="border rounded-xl p-4 bg-muted/20">
                            <p className="font-semibold text-sm text-foreground">Metro Cities (Delhi, Mumbai, etc.)</p>
                            <p className="text-2xl font-bold text-primary mt-1">3 – 5 Days</p>
                            <p className="text-xs text-muted-foreground mt-1">Air express routing</p>
                        </div>
                        <div className="border rounded-xl p-4 bg-muted/20">
                            <p className="font-semibold text-sm text-foreground">Rest of India &amp; Remote Pincodes</p>
                            <p className="text-2xl font-bold text-primary mt-1">5 – 7 Days</p>
                            <p className="text-xs text-muted-foreground mt-1">Surface / Air transit</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2">
                        <em>Disclaimer:</em> Delivery timelines are estimates provided by courier companies. Delays caused by natural weather disruptions, regional holidays, or unforeseen transport issues are beyond our direct control, but our support team tracks every shipment actively.
                    </p>
                </section>

                {/* 4. Shipping Rates */}
                <section className="space-y-3 bg-muted/40 border border-border/80 rounded-2xl p-6">
                    <h2 className="text-xl font-bold font-heading text-primary">4. Shipping Charges &amp; Free Shipping</h2>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li>
                            <strong>Orders above ₹1,499:</strong> <strong>FREE Standard Delivery</strong> across all serviceable pincodes in India.
                        </li>
                        <li>
                            <strong>Orders below ₹1,499:</strong> A nominal flat shipping charge of <strong>₹99</strong> is applied at checkout to cover safe botanical packaging and protective crates.
                        </li>
                        <li>
                            Shipping charges are clearly calculated and displayed on the checkout page before payment is completed. There are zero hidden fees.
                        </li>
                    </ul>
                </section>

                {/* 5. Special Live-Plant Packaging */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                        <h2 className="text-xl font-bold font-heading">5. Specialized Plant-Safe Packaging</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        Shipping delicate living plants requires specialized engineering:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li><strong>Root &amp; Moisture Lock:</strong> The root ball is secured with breathable, moisture-locking material so roots stay hydrated for up to 8 days.</li>
                        <li><strong>Spill-Proof Soil Seal:</strong> Pots are sealed to ensure zero soil spillage inside the box even if inverted.</li>
                        <li><strong>Heavy-Duty Corrugated Outer Box:</strong> Custom 5-ply reinforced carton boxes designed to resist pressure and stacking.</li>
                        <li><strong>Ventilation Apertures:</strong> Air vents ensure fresh oxygen circulation throughout transit.</li>
                    </ul>
                </section>

                {/* 6. Shipment Tracking */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                        <h2 className="text-xl font-bold font-heading">6. Real-Time Tracking</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        As soon as your package is dispatched, you will receive an email and SMS containing:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li>Courier partner name (e.g. Blue Dart, Delhivery)</li>
                        <li>Air Waybill (AWB) tracking number</li>
                        <li>Direct live tracking link</li>
                    </ul>
                    <p className="text-muted-foreground text-sm">
                        You can also track your order at any time using our dedicated <a href="/track-order" className="text-primary font-medium hover:underline">Track Order</a> page.
                    </p>
                </section>

                {/* 7. Contact Info */}
                <section className="space-y-3 border-t pt-8">
                    <h2 className="text-xl font-bold font-heading">7. Shipping Queries &amp; Support</h2>
                    <p className="text-muted-foreground text-sm">
                        If your tracking has not updated for more than 48 hours, or if you need to provide special delivery instructions, contact us:
                    </p>
                    <div className="bg-card border rounded-xl p-5 space-y-2 text-sm">
                        <p className="font-semibold text-foreground">Travancore Gardens Logistics Desk</p>
                        <p className="text-muted-foreground">
                            📧 <strong>Email:</strong> <a href="mailto:support@travancoregardens.com" className="text-primary hover:underline">support@travancoregardens.com</a>
                        </p>
                        <p className="text-muted-foreground">
                            📞 <strong>Phone:</strong> <a href="tel:+918078315506" className="text-primary hover:underline">+91 80783 15506</a>
                        </p>
                        <p className="text-muted-foreground">
                            📍 <strong>Warehouse / Nursery:</strong> Ambalathinkala, Kattakkada, Thiruvananthapuram, Kerala – 695572, India
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
