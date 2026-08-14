import { Separator } from "@/components/ui/separator";
import { FileText } from "lucide-react";

export const metadata = {
    title: "Terms of Service | Travancore Gardens",
    description: "Terms and conditions for using Travancore Gardens website and services.",
};

export default function TermsOfServicePage() {
    const sections = [
        {
            title: "Acceptance of Terms",
            content: `By accessing or using the Travancore Gardens website (travancoregardens.in) or any of our services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.

We reserve the right to update these terms at any time. Continued use of our services after changes constitutes your acceptance of the updated terms.`,
        },
        {
            title: "Products and Pricing",
            content: `All prices listed on our website are in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time without prior notice.

Product images are for illustrative purposes. Actual plant appearances may vary due to natural variation, seasons, and growing conditions. We strive to accurately represent all products but cannot guarantee exact colour matches.`,
        },
        {
            title: "Orders and Payment",
            content: `By placing an order, you represent that you are at least 18 years of age and that the information you provide is accurate and complete.

Payment is processed securely through Razorpay. We accept UPI, credit/debit cards, net banking, and other supported payment methods. Orders are confirmed only after successful payment authorisation.

We reserve the right to cancel any order at our discretion, including cases of pricing errors, suspected fraud, or unavailability of the product.`,
        },
        {
            title: "Shipping and Delivery",
            content: `We ship across India through our logistics partner, Shiprocket. Delivery timelines are estimates and may vary due to location, weather, courier capacity, or other unforeseen circumstances.

Shipping charges (if any) are calculated at checkout based on your delivery location and order weight. Free shipping thresholds may apply on qualifying orders.

Risk of loss or damage to products transfers to you upon delivery. We are not responsible for delays or losses caused by the courier.`,
        },
        {
            title: "Returns and Refunds",
            content: `We accept return requests within 7 days of delivery under the following conditions:
• The product is damaged, defective, or significantly different from what was ordered
• The item must be in its original packaging (where applicable)
• Perishable or living plants must be reported within 48 hours of delivery with photo evidence

To initiate a return, contact us at returns@travancoregardens.in with your order number and photos.

Refunds are processed within 7–10 business days after we receive and inspect the returned item.`,
        },
        {
            title: "Plant Care Responsibility",
            content: `Living plants are perishable products. Their health and longevity depend on proper care after delivery. We provide care guides for all our plants, but we cannot be held responsible for plant death or decline caused by:
• Improper watering, light, or temperature conditions
• Repotting errors
• Pest infestations after delivery
• Negligence after delivery`,
        },
        {
            title: "Account and Security",
            content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorised use of your account.

We reserve the right to terminate or suspend accounts that violate these terms, engage in fraudulent activity, or abuse our services.`,
        },
        {
            title: "Intellectual Property",
            content: `All content on this website — including text, images, logos, graphics, and product descriptions — is owned by Travancore Gardens or its content suppliers and is protected by Indian and international copyright laws.

You may not reproduce, distribute, or use our content for commercial purposes without written permission.`,
        },
        {
            title: "Limitation of Liability",
            content: `To the maximum extent permitted by law, Travancore Gardens shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services or products.

Our total liability to you for any claim arising from these terms shall not exceed the amount you paid for the specific order giving rise to the claim.`,
        },
        {
            title: "Governing Law",
            content: `These Terms of Service shall be governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Thiruvananthapuram, Kerala, India.

If any provision of these terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.`,
        },
        {
            title: "Contact Us",
            content: `For any questions about these Terms of Service, please contact us:

📧 Email: legal@travancoregardens.in
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
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-primary uppercase tracking-wide">Legal</span>
                </div>
                <h1 className="text-4xl font-bold font-heading mb-3">Terms of Service</h1>
                <p className="text-muted-foreground">
                    Last updated: <strong>March 2025</strong>
                </p>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                    Please read these terms carefully before using our website or placing an order.
                    These terms govern your relationship with Travancore Gardens.
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
                <p>These terms were last reviewed and updated in <strong>March 2025</strong>.</p>
                <p className="mt-1">Travancore Gardens · Kattakkada, Thiruvananthapuram, Kerala – 695572, India</p>
            </div>
        </div>
    );
}
