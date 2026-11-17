import { Ban, AlertCircle, CheckCircle2, ShieldAlert, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export const metadata = {
    title: "No Cancellation & No Refund Policy | Travancore Gardens",
    description: "Read our strict No Cancellation, No Return, and No Refund policy for live plants and gardening supplies.",
};

export default function RefundPolicyPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <Ban className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 uppercase tracking-wide">
                        All Sales Are Final
                    </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-3 text-foreground">
                    Cancellation &amp; Refund Policy
                </h1>
                <p className="text-muted-foreground text-sm">
                    Last updated: <strong>November 2026</strong>
                </p>
                
                {/* Prominent Callout Banner */}
                <div className="mt-6 p-5 rounded-xl border border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold text-sm">Strict No Cancellation &amp; No Refund Policy</p>
                            <p className="text-xs mt-1 leading-relaxed opacity-90">
                                Due to the living, delicate, and perishable nature of agricultural plants and botanical specimens, 
                                <strong> Travancore Gardens maintains a strict NO CANCELLATION, NO RETURN, and NO REFUND policy</strong> once an order is confirmed and placed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Separator className="mb-10" />

            {/* Content Sections */}
            <div className="space-y-10 text-foreground">
                {/* 1. No Order Cancellation */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Ban className="h-5 w-5 text-destructive shrink-0" />
                        <h2 className="text-xl font-bold font-heading">1. No Order Cancellations</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        Please review your shopping cart, plant varieties, recipient address, and order details carefully before submitting payment:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li>
                            <strong>Immediate Processing:</strong> Once an order is placed and confirmed through our website, it is instantly routed to our nursery team for custom hydration, potting, root inspection, and protective packing.
                        </li>
                        <li>
                            <strong>No Cancellations Accepted:</strong> We <strong>do not accept cancellations or order modifications</strong> once payment has been completed.
                        </li>
                    </ul>
                </section>

                {/* 2. No Returns & No Exchanges */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                        <h2 className="text-xl font-bold font-heading">2. No Returns or Exchanges (Perishable Goods)</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        Live plants are living organisms that require continuous water, ventilation, and gentle sunlight:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li>
                            <strong>Plants Cannot Survive Return Transit:</strong> Courier return transit subjecting plants to secondary packaging, prolonged darkness, and courier warehouse delays is fatal to live flora. Therefore, <strong>returns are strictly not accepted under any circumstances</strong>.
                        </li>
                        <li>
                            <strong>Pots, Planters &amp; Supplies:</strong> All planters, pots, soil mixes, fertilizers, and gardening accessories sold on our website are also final sale and non-returnable.
                        </li>
                    </ul>
                </section>

                {/* 3. Transit Damage - Replacement Guarantee Only */}
                <section className="space-y-3 bg-muted/30 border border-border/80 rounded-2xl p-6">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        <h2 className="text-xl font-bold font-heading text-primary">3. Transit Damage Guarantee (Replacement Only — No Cash Refunds)</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        While we do not issue monetary refunds, we stand behind the quality of our nursery. In the rare event that a plant or pot arrives severely damaged in transit:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li>
                            <strong>24-Hour Notice Window:</strong> You must report transit damage within <strong>24 hours of package delivery</strong> (as recorded by the courier tracking system).
                        </li>
                        <li>
                            <strong>Mandatory Unboxing Proof:</strong> You must provide an <strong>unedited unboxing video</strong> along with high-resolution photos clearly showing the outer shipping box with courier label, internal packaging, and the damaged plant/pot.
                        </li>
                        <li>
                            <strong>Resolution:</strong> Upon verification by our horticulture team, we will dispatch a <strong>free replacement plant or pot</strong> with priority express shipping. <strong>We do NOT issue cash or card refunds.</strong>
                        </li>
                    </ul>
                </section>

                {/* 4. What is Not Eligible for Replacement */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                        <h2 className="text-xl font-bold font-heading">4. What is Not Covered Under Replacement</h2>
                    </div>
                    <p className="text-muted-foreground text-sm">The following scenarios are not eligible for replacement:</p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li><strong>Normal Transit Stress:</strong> Minor drooping, minor leaf browning, or shedding of 1–2 bottom leaves during transit. This is completely natural; plants bounce back within 2–3 days with water and indirect sunlight.</li>
                        <li><strong>Improper Post-Delivery Care:</strong> Overwatering, underwatering, exposing immediately to scorching direct sun, or repotting into new soil before acclimation.</li>
                        <li><strong>Customer Address Errors:</strong> Parcels delayed or undelivered due to an incorrect shipping address, wrong pincode, or unreachable phone number provided at checkout.</li>
                        <li><strong>Customer Unavailability:</strong> Packages delayed because the recipient was unavailable or refused delivery when the courier attempted drop-off.</li>
                    </ul>
                </section>

                {/* 5. Gateway Technical Glitches & Stock Unavailability */}
                <section className="space-y-3 border rounded-xl p-5 bg-card">
                    <h2 className="text-lg font-bold font-heading text-foreground">5. Technical Double Payments &amp; Merchant Unavailability</h2>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                        The only situations where a monetary refund will ever be initiated through Razorpay are:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground mt-2">
                        <li>
                            <strong>Technical Duplicate Debit:</strong> If your card or UPI account was charged twice for a single order due to a network timeout, the duplicate charge will be automatically refunded back to your original payment source via Razorpay within <strong>5 to 7 business days</strong>.
                        </li>
                        <li>
                            <strong>Non-fulfillment by Seller:</strong> In the rare event that an item is out of stock or our courier cannot service your postal pincode, Travancore Gardens will cancel the order internally and initiate a 100% full refund to your original payment source within <strong>5 to 7 business days</strong>.
                        </li>
                    </ul>
                </section>

                {/* 6. Contact Information */}
                <section className="space-y-3 border-t pt-8">
                    <h2 className="text-xl font-bold font-heading">6. Customer Support &amp; Assistance</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        For any questions regarding plant care, order status, or reporting transit damage, please contact our team:
                    </p>
                    <div className="bg-card border rounded-xl p-5 space-y-2 text-sm">
                        <p className="font-semibold text-foreground">Travancore Gardens Customer Care</p>
                        <p className="text-muted-foreground">
                            📧 <strong>Email:</strong> <a href="mailto:support@travancoregardens.com" className="text-primary hover:underline">support@travancoregardens.com</a>
                        </p>
                        <p className="text-muted-foreground">
                            📞 <strong>Phone / WhatsApp:</strong> <a href="tel:+918078315506" className="text-primary hover:underline">+91 80783 15506</a>
                        </p>
                        <p className="text-muted-foreground">
                            📍 <strong>Nursery &amp; Warehouse:</strong> Ambalathinkala, Kattakkada, Thiruvananthapuram, Kerala – 695572, India
                        </p>
                        <p className="text-muted-foreground">
                            🕒 <strong>Operational Hours:</strong> Monday to Saturday, 9:00 AM – 6:00 PM IST
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
