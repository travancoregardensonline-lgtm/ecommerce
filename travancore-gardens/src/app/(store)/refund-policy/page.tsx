import { RotateCcw, AlertCircle, CheckCircle2, Clock, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export const metadata = {
    title: "Cancellation & Refund Policy | Travancore Gardens",
    description: "Read our comprehensive cancellation, return, and refund policy for plants and gardening accessories.",
};

export default function RefundPolicyPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <RotateCcw className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-primary uppercase tracking-wide">Razorpay Compliance</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-3 text-foreground">
                    Cancellation &amp; Refund Policy
                </h1>
                <p className="text-muted-foreground text-sm">
                    Last updated: <strong>November 2026</strong>
                </p>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                    At <strong>Travancore Gardens</strong>, we strive to deliver healthy, happy plants and quality gardening products to your doorstep. Because living plants require special care during transit, please read our cancellation, return, and refund guidelines outlined below.
                </p>
            </div>

            <Separator className="mb-10" />

            {/* Content Sections */}
            <div className="space-y-10 text-foreground">
                {/* 1. Order Cancellation */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary shrink-0" />
                        <h2 className="text-xl font-bold font-heading">1. Order Cancellation Policy</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        You can cancel your order under the following terms:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li>
                            <strong>Before Dispatch:</strong> Orders can be cancelled free of charge within <strong>24 hours</strong> of placement or before the shipment has been dispatched from our nursery warehouse (whichever comes first).
                        </li>
                        <li>
                            <strong>After Dispatch:</strong> Once an order is packed and handed over to our logistics partner (Shiprocket / courier), cancellation is no longer possible because living plants cannot withstand indefinite storage in courier hubs.
                        </li>
                        <li>
                            To cancel an order before dispatch, please contact us immediately via WhatsApp/Phone at <strong>+91 80783 15506</strong> or email <strong>support@travancoregardens.com</strong> with your Order ID (e.g. <code>TG-XXXXXX</code>).
                        </li>
                    </ul>
                </section>

                {/* 2. Living Plants Return Policy */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-primary shrink-0" />
                        <h2 className="text-xl font-bold font-heading">2. Damaged or Defective Items (Transit Guarantee)</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        Living plants are perishable and sensitive. We take extra care with specialized custom packaging to secure roots, soil, and foliage. However, in the rare event of transit damage:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li>
                            <strong>Notification Period:</strong> Any complaint regarding transit damage, severe wilting, broken stems, root decay, or wrong item delivery must be reported within <strong>48 hours of delivery</strong>.
                        </li>
                        <li>
                            <strong>Required Evidence:</strong> Please share clear unboxing photos or a short video showing the outer shipping box with the shipping label and the condition of the damaged plant/pot to <strong>support@travancoregardens.com</strong> or WhatsApp <strong>+91 80783 15506</strong>.
                        </li>
                        <li>
                            <strong>Resolution:</strong> Upon verification, we will provide you with a <strong>free replacement</strong> dispatched with high priority, or a <strong>100% full refund</strong>, depending on your preference.
                        </li>
                    </ul>
                </section>

                {/* 3. Non-Plant Items (Pots, Tools, Accessories) */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        <h2 className="text-xl font-bold font-heading">3. Returns for Pots, Planters &amp; Gardening Supplies</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        For non-living products such as ceramic pots, plastic planters, organic fertilizers, and tools:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li>
                            You may request a return within <strong>7 days</strong> of delivery if the product is defective, damaged, or completely different from the description.
                        </li>
                        <li>
                            The item must be unused, in its original packaging, and with all tags intact.
                        </li>
                        <li>
                            We will arrange a reverse pickup through our courier partner at no additional cost for defective items.
                        </li>
                    </ul>
                </section>

                {/* 4. Non-Returnable Scenarios */}
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                        <h2 className="text-xl font-bold font-heading">4. What is Not Covered</h2>
                    </div>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li>Minor cosmetic imperfections, natural leaf variations, or slight shedding of 1–2 lower leaves caused by transit stress (normal for live plants; plants recover quickly with water and indirect sunlight).</li>
                        <li>Plant damage caused by improper post-delivery care (overwatering, underwatering, direct harsh sunlight, or repotting immediately upon arrival).</li>
                        <li>Orders delivered to incorrect shipping addresses provided by the customer.</li>
                        <li>Failed deliveries due to customer unavailability after multiple delivery attempts by the courier.</li>
                    </ul>
                </section>

                {/* 5. Refund Method & Timelines */}
                <section className="space-y-3 bg-muted/40 border border-border/80 rounded-2xl p-6">
                    <h2 className="text-xl font-bold font-heading text-primary">5. Refund Processing Timelines (Razorpay)</h2>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                        Once your cancellation or refund claim is approved by our support team:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                        <li>
                            <strong>Method of Refund:</strong> All refunds are automatically routed back to the <strong>original source of payment</strong> (Credit Card, Debit Card, Net Banking, UPI wallet/VPA) through our authorized payment partner, <strong>Razorpay</strong>.
                        </li>
                        <li>
                            <strong>Refund Credit Timeline:</strong> The refund will be credited to your bank account or payment method within <strong>5 to 7 business days</strong> from the date of refund initiation, depending on your issuing bank&apos;s settlement schedule.
                        </li>
                        <li>
                            <strong>Cash on Delivery (COD) Orders:</strong> For approved refunds on COD orders, our support team will contact you to collect your preferred UPI ID or Bank NEFT account details to process the refund within <strong>5 to 7 business days</strong>.
                        </li>
                    </ul>
                </section>

                {/* 6. Contact Information */}
                <section className="space-y-3 border-t pt-8">
                    <h2 className="text-xl font-bold font-heading">6. How to Reach Us for Refunds</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        If you have any questions, concerns, or requests regarding cancellations or refunds, our customer support team is happy to assist:
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
                            📍 <strong>Address:</strong> Ambalathinkala, Kattakkada, Thiruvananthapuram, Kerala – 695572, India
                        </p>
                        <p className="text-muted-foreground">
                            🕒 <strong>Hours:</strong> Monday to Saturday, 9:00 AM – 6:00 PM IST
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
