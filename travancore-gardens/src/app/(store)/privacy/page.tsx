import { Separator } from "@/components/ui/separator";
import { ShieldCheck } from "lucide-react";

export const metadata = {
    title: "Privacy Policy | Travancore Gardens",
    description: "How Travancore Gardens collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
    const sections = [
        {
            title: "Information We Collect",
            content: `We collect information you provide directly to us when you create an account, place an order, or contact us. This includes your name, email address, phone number, shipping address, and payment information (processed securely through Razorpay — we never store card details).

We also automatically collect certain device and usage information when you visit our website, such as your IP address, browser type, pages visited, and referral URLs.`,
        },
        {
            title: "How We Use Your Information",
            content: `We use the information we collect to:
• Process and fulfil your orders and send related communications
• Manage your account and provide customer support
• Send promotional communications (you can opt out at any time)
• Improve our website, products, and services
• Detect and prevent fraud or other illegal activities
• Comply with legal obligations`,
        },
        {
            title: "Sharing Your Information",
            content: `We share your information only in the following ways:
• With Shiprocket (our logistics partner) to fulfil and track your deliveries
• With Razorpay to process payments securely
• With Cloudinary to serve product images
• With Supabase for database and authentication services
• When required by law or to protect our rights

We do not sell, trade, or rent your personal information to third parties.`,
        },
        {
            title: "Cookies",
            content: `We use cookies and similar tracking technologies to maintain your session, remember your cart, and analyse website traffic. You can control cookie settings in your browser. Disabling cookies may affect the functionality of certain features such as cart and login.`,
        },
        {
            title: "Data Security",
            content: `We implement industry-standard security measures to protect your personal information. All data is transmitted over SSL/TLS encryption. Passwords are never stored in plain text. Payment information is processed by PCI-compliant payment gateways.

However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.`,
        },
        {
            title: "Your Rights",
            content: `You have the right to:
• Access the personal information we hold about you
• Correct inaccurate or incomplete information
• Request deletion of your personal data
• Withdraw consent to marketing communications at any time
• Lodge a complaint with the relevant data protection authority

To exercise any of these rights, contact us at privacy@travancoregardens.in`,
        },
        {
            title: "Data Retention",
            content: `We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Order data is retained for a minimum of 7 years as required by Indian tax laws. You may request deletion of your account data (excluding legally required records) by contacting us.`,
        },
        {
            title: "Children's Privacy",
            content: `Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.`,
        },
        {
            title: "Changes to This Policy",
            content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a prominent notice on our website. Your continued use of our services after such changes constitutes your acceptance of the updated policy.`,
        },
        {
            title: "Contact Us",
            content: `For any privacy-related questions or concerns, please contact us:

📧 Email: privacy@travancoregardens.in
📞 Phone: +91 80783 15506
📍 Address: Kattakkada, Thiruvananthapuram, Kerala – 695572, India`,
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
                    <span className="text-sm font-semibold text-primary uppercase tracking-wide">Legal</span>
                </div>
                <h1 className="text-4xl font-bold font-heading mb-3">Privacy Policy</h1>
                <p className="text-muted-foreground">
                    Last updated: <strong>March 2025</strong>
                </p>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                    At Travancore Gardens, we take your privacy seriously. This policy explains how we collect,
                    use, and protect your personal information when you use our website and services.
                </p>
            </div>

            <Separator className="mb-10" />

            {/* Sections */}
            <div className="space-y-10">
                {sections.map((section, idx) => (
                    <div key={section.title}>
                        <h2 className="text-xl font-bold font-heading mb-3 flex items-start gap-2">
                            <span className="text-primary font-mono text-base mt-0.5">{String(idx + 1).padStart(2, "0")}.</span>
                            {section.title}
                        </h2>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
                    </div>
                ))}
            </div>

            <Separator className="my-10" />

            <div className="bg-muted/40 rounded-xl p-6 text-center text-sm text-muted-foreground">
                <p>This policy applies to all users of <strong>travancoregardens.in</strong> and its associated mobile applications.</p>
                <p className="mt-1">By using our services, you agree to the collection and use of information as described in this policy.</p>
            </div>
        </div>
    );
}
