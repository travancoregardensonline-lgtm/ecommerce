import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Terms and Conditions | Travancore Gardens",
    description: "Terms and conditions for using Travancore Gardens website, placing plant orders, and payment gateway rules.",
};

export default function TermsOfServicePage() {
    const sections = [
        {
            title: "Acceptance of Terms",
            content: `By accessing or using the Travancore Gardens website (travancoregardens.com / travancoregardens.in) or placing any order with us, you agree to be bound by these Terms and Conditions, our Privacy Policy, our Shipping Policy, and our Cancellation & Refund Policy. If you do not agree with any part of these terms, please do not use our website.

We reserve the right to update or modify these terms at any time. Continued use of our website or services following any updates constitutes acceptance of the revised terms.`,
        },
        {
            title: "Merchant Details & Operating Entity",
            content: `This website is operated by Travancore Gardens, with registered and operating nursery facilities located at Ambalathinkala, Kattakkada, Thiruvananthapuram, Kerala – 695572, India.

All customer communications, order dispatches, invoicing, and service deliveries are executed under the commercial trade name Travancore Gardens.`,
        },
        {
            title: "Products, Living Plants & Pricing",
            content: `All prices listed on our website are in Indian Rupees (INR, ₹) and are inclusive of applicable GST / taxes unless specified otherwise. We reserve the right to change product prices, discounts, and promotional offers without prior notice.

Important Botanical Disclaimer: Living plants are natural organisms. Product photographs represent typical specimens; actual plants delivered may have slight variations in height, foliage volume, variegation, or number of leaves due to seasonality and natural growth characteristics. All plants are sent healthy, inspected, and securely potted/wrapped.`,
        },
        {
            title: "Orders, User Eligibility & Checkout",
            content: `By placing an order on our store, you represent and warrant that:
• You are at least 18 years of age or accessing under the supervision of a parent/guardian.
• All information you provide (Name, Shipping Address, Email Address, and Mobile Number) is true, complete, and accurate.
• You can purchase through our fast Guest Checkout or through an optional registered customer account.

We reserve the right to cancel or decline any order in cases of technical pricing discrepancies, stock unavailability, suspected unauthorized transactions, or unserviceable courier pin codes. In such events, a 100% full refund will be initiated immediately.`,
        },
        {
            title: "Payments & Payment Gateway (Razorpay)",
            content: `We offer secure digital payments powered by Razorpay Software Private Limited (Razorpay). 

Supported payment methods include:
• Credit Cards & Debit Cards (Visa, MasterCard, RuPay, Maestro)
• Unified Payments Interface (UPI via Google Pay, PhonePe, Paytm, BHIM, etc.)
• Net Banking across 50+ major Indian banks

By selecting an online payment method, you agree to Razorpay's terms and authorize the transaction amount. We do not store your complete credit/debit card numbers, CVV, or banking passwords on our servers. All financial transactions are encrypted through 256-bit bank-grade SSL/TLS protocols compliant with PCI-DSS standards.`,
        },
        {
            title: "Shipping, Delivery & Transit Timelines",
            content: `We ship pan-India across 26,000+ pin codes through Shiprocket and leading express logistics couriers (Blue Dart, Delhivery, DTDC, Xpressbees).

Standard orders are dispatched within 24 to 48 hours of payment confirmation. Estimated delivery time ranges between 3 to 7 business days depending on customer distance and courier connectivity. Full details can be reviewed in our Shipping & Delivery Policy.`,
        },
        {
            title: "No Cancellation & No Refund Policy",
            content: `Travancore Gardens operates under a strict No Cancellation, No Return, No Replacement, and No Refund policy for all purchases made through our website. Due to the living, delicate, and perishable nature of agricultural plants and botanical goods, all sales are final once an order is placed and confirmed.

We do not accept order cancellations, returns, replacements, or cash/card refunds under any circumstances. Technical duplicate payments or orders that cannot be fulfilled by us will be refunded back to the original payment source within 5 to 7 business days via Razorpay. Full details can be reviewed in our dedicated Cancellation & Refund Policy.`,
        },
        {
            title: "Intellectual Property Rights",
            content: `All content featured on this website — including plant photography, brand logos, graphics, botanical plant descriptions, UI design, and software code — is the intellectual property of Travancore Gardens. Reproduction, redistribution, or unauthorized commercial scraping without prior written consent is strictly prohibited.`,
        },
        {
            title: "Limitation of Liability",
            content: `To the fullest extent permitted by Indian law, Travancore Gardens, its owners, and affiliates shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from the use of our products, courier delays beyond reasonable control, or post-delivery plant mortality due to environmental factors.

Our aggregate liability for any claim arising from an order shall not exceed the total purchase value paid by you for that specific order.`,
        },
        {
            title: "Governing Law & Legal Jurisdiction",
            content: `These Terms and Conditions and any transactions concluded on this platform shall be governed by, construed, and enforced in accordance with the substantive laws of India.

Any legal disputes or proceedings arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts of Thiruvananthapuram, Kerala, India.`,
        },
        {
            title: "Customer Support & Grievance Contact",
            content: `For any queries, complaints, or legal notices concerning these Terms & Conditions, please reach out to us:

📧 Official Support Email: travancoregardensonline@gmail.com
📧 Legal Inquiries: travancoregardensonline@gmail.com
📍 Operational Address: Ambalathinkala, Kattakkada, Thiruvananthapuram, Kerala – 695572, India
🕒 Operational Hours: Monday to Saturday, 9:00 AM – 6:00 PM IST`,
        },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-primary uppercase tracking-wide">Razorpay Compliance</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-3 text-foreground">Terms and Conditions</h1>
                <p className="text-muted-foreground text-sm">
                    Last updated: <strong>November 2026</strong>
                </p>
                <p className="text-muted-foreground mt-3 leading-relaxed text-sm">
                    Please read these Terms and Conditions carefully before browsing our store or purchasing any plants or accessories. These terms constitute a legally binding agreement between you and Travancore Gardens.
                </p>
            </div>

            <Separator className="mb-10" />

            {/* Quick Links Banner */}
            <div className="mb-10 p-4 rounded-xl bg-muted/40 border border-border/80 flex flex-wrap gap-4 text-xs font-semibold">
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy →</Link>
                <Link href="/refund-policy" className="text-primary hover:underline">Cancellation &amp; Refund Policy →</Link>
                <Link href="/shipping-policy" className="text-primary hover:underline">Shipping &amp; Delivery Policy →</Link>
                <Link href="/contact" className="text-primary hover:underline">Contact Us →</Link>
            </div>

            {/* Sections */}
            <div className="space-y-10">
                {sections.map((section, idx) => (
                    <div key={section.title} className="space-y-2">
                        <h2 className="text-xl font-bold font-heading mb-2 flex items-start gap-2 text-foreground">
                            <span className="text-primary font-mono text-base mt-0.5">{String(idx + 1).padStart(2, "0")}.</span>
                            {section.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">{section.content}</p>
                    </div>
                ))}
            </div>

            <Separator className="my-10" />

            <div className="bg-muted/40 rounded-xl p-6 text-center text-sm text-muted-foreground">
                <p>These terms are compliant with Indian Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020.</p>
                <p className="mt-1 font-semibold text-foreground">Travancore Gardens · Ambalathinkala, Kattakkada, Thiruvananthapuram, Kerala – 695572, India</p>
            </div>
        </div>
    );
}
