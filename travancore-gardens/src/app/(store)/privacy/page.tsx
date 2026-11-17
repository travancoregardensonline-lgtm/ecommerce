import { Separator } from "@/components/ui/separator";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Privacy Policy | Travancore Gardens",
    description: "Learn how Travancore Gardens collects, uses, and safeguards your personal data and payment security.",
};

export default function PrivacyPolicyPage() {
    const sections = [
        {
            title: "Information We Collect",
            content: `We collect information necessary to fulfill your plant and gardening orders and provide a seamless shopping experience:

1. Personal Identification Information: Full Name, Email Address, and Contact Mobile Number.
2. Shipping & Billing Details: Delivery street address, city, state, postal pincode, and optional landmark.
3. Order History: Products purchased, transaction amount, order dates, and courier tracking identifiers.
4. Device & Browsing Data: IP address, device operating system, browser type, and anonymous session cookies to keep items in your cart.

We never collect sensitive personal information, biometric data, or medical information.`,
        },
        {
            title: "Payment Information & Razorpay Security",
            content: `All financial payments on Travancore Gardens are securely processed by Razorpay Software Private Limited (Razorpay), India's leading RBI-authorized payment aggregator.

• Zero Card Storage: Travancore Gardens does NOT capture, view, or store your credit/debit card numbers, CVV security codes, UPI PINs, or net banking credentials on our servers.
• Bank-Grade Encryption: All payments are processed through Razorpay's 256-bit encrypted SSL payment gateway, compliant with Payment Card Industry Data Security Standards (PCI-DSS Level 1).
• When you make a payment, your financial details are submitted directly to Razorpay and your issuing bank under strict end-to-end security protocols.`,
        },
        {
            title: "How We Use Your Personal Data",
            content: `Your data is utilized strictly for lawful e-commerce operations:
• Processing, assembling, and packaging your plant orders.
• Communicating order confirmation, invoice receipts, and live courier tracking links.
• Enabling customer support agents to resolve delivery, plant care, or refund inquiries.
• Preventing fraudulent card transactions and unauthorized website access.
• Sending occasional seasonal offers or plant care guides (only if you opt-in; you can unsubscribe anytime with one click).`,
        },
        {
            title: "Third-Party Data Sharing & Logistics",
            content: `We do not sell, rent, monetize, or trade your personal information to third-party advertisers or data brokers under any circumstances.

We only disclose minimal required data to authorized service partners:
• Logistics Partner (Shiprocket & Courier Companies): We provide only your recipient name, delivery address, and phone number so the courier can deliver the package and call you upon arrival.
• Payment Partner (Razorpay): For authorizing and settling your purchase amount.
• Database & Cloud Infrastructure (Supabase & Cloudinary): For secure, encrypted database management and fast delivery of plant photos.
• Legal Authorities: Only when explicitly mandated by Indian statutory authorities or court orders under applicable laws.`,
        },
        {
            title: "Cookies and Local Storage",
            content: `Our website utilizes standard HTTP cookies and browser LocalStorage to:
• Remember plants placed in your shopping cart across sessions.
• Keep you logged into your customer account if you choose to sign in.
• Understand aggregate site traffic patterns to improve site speed and usability.

You can modify your browser settings to reject cookies; however, note that disabling cookies may impair core shopping cart and checkout functionalities.`,
        },
        {
            title: "Data Security and Retention",
            content: `We implement enterprise-grade security protocols to safeguard your personal data against unauthorized access, loss, or alteration. All web traffic is strictly served over HTTPS (Hypertext Transfer Protocol Secure).

We retain order records for the duration required by Indian accounting, tax (GST), and audit regulations (typically 7 years). For guest shoppers or inactive accounts, you may request deletion of non-statutory data at any time.`,
        },
        {
            title: "Your Rights & Choices",
            content: `Under applicable Indian data protection laws, you retain the following rights:
• Right to Access: Request a copy of the personal information we maintain about you.
• Right to Correction: Request correction of outdated or incorrect contact/shipping information.
• Right to Opt-out: Unsubscribe from promotional email newsletters at any time.
• Right to Deletion: Request removal of your customer account profile by emailing support@travancoregardens.com.`,
        },
        {
            title: "Grievance Officer (Mandatory Compliance)",
            content: `In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, the contact details of our designated Grievance Officer are provided below:

Name: Grievance Redressal Officer
Entity: Travancore Gardens
Address: Ambalathinkala, Kattakkada, Thiruvananthapuram, Kerala – 695572, India
Email: grievance@travancoregardens.com / support@travancoregardens.com
Phone: +91 80783 15506
Working Hours: Monday to Friday, 10:00 AM – 5:00 PM IST

We acknowledge grievances within 48 hours and strive to resolve any dispute within 30 days from receipt.`,
        },
        {
            title: "Updates to This Policy",
            content: `We reserve the right to revise this Privacy Policy periodically to reflect technological, legal, or operational updates. Any material changes will be announced with an updated "Last Updated" date at the top of this page.`,
        },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-primary uppercase tracking-wide">Razorpay Compliance</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-3 text-foreground">Privacy Policy</h1>
                <p className="text-muted-foreground text-sm">
                    Last updated: <strong>November 2026</strong>
                </p>
                <p className="text-muted-foreground mt-3 leading-relaxed text-sm">
                    At Travancore Gardens, your privacy and financial security are our foremost priorities. This Privacy Policy delineates how we handle your personal information when you visit our store or purchase plants.
                </p>
            </div>

            <Separator className="mb-10" />

            {/* Quick Links Banner */}
            <div className="mb-10 p-4 rounded-xl bg-muted/40 border border-border/80 flex flex-wrap gap-4 text-xs font-semibold">
                <Link href="/terms" className="text-primary hover:underline">Terms &amp; Conditions →</Link>
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
                <p>Travancore Gardens is committed to zero data leakage and 100% PCI-DSS compliant payment processing.</p>
                <p className="mt-1 font-semibold text-foreground">Travancore Gardens · Ambalathinkala, Kattakkada, Thiruvananthapuram, Kerala – 695572, India</p>
            </div>
        </div>
    );
}
