"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        category: "Ordering & Shipping",
        questions: [
            {
                q: "Where do you ship?",
                a: "We currently ship to all select pin codes across India. If your pin code is serviceable, it will be confirmed at checkout."
            },
            {
                q: "How long does shipping take?",
                a: "Standard shipping takes 3-5 business days depending on your location. Plants are carefully packed to survive the journey."
            },
            {
                q: "Do you offer free shipping?",
                a: "Yes! We offer free standard shipping on all orders over ₹999."
            }
        ]
    },
    {
        category: "Plant Care",
        questions: [
            {
                q: "What if my plant arrives damaged in transit?",
                a: "If a plant or pot arrives severely damaged in transit, please share an unboxing video and photos with us within 24 hours of delivery. Upon verification, we will send a free replacement plant. We maintain a strict no-refund policy."
            },
            {
                q: "How do I know how to care for my new plant?",
                a: "Every plant comes with a detailed care card. You can also view care instructions on the product page or in our Plant Care Guide section."
            },
            {
                q: "Are the planters included?",
                a: "All plants come in a standard nursery grower pot. Decorative ceramic pots or baskets are sold separately or as add-on upgrades."
            }
        ]
    },
    {
        category: "Cancellations & Returns",
        questions: [
            {
                q: "Can I cancel my order?",
                a: "No. Because plants are living goods prepared immediately for transit, orders cannot be cancelled or modified once confirmed."
            },
            {
                q: "Can I return a plant or gardening accessory?",
                a: "Due to the delicate and perishable nature of live flora, all sales are final. We maintain a strict No Return, No Cancellation, and No Refund policy."
            }
        ]
    }
];

export default function FAQPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-4xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight">Frequently Asked Questions</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Find answers to common questions about our plants, shipping, policies, and more.
                </p>
            </div>

            <div className="space-y-12">
                {faqs.map((section, idx) => (
                    <div key={idx}>
                        <h2 className="text-2xl font-bold mb-6 font-heading">{section.category}</h2>
                        <Accordion type="single" collapsible className="w-full bg-card border rounded-lg px-6">
                            {section.questions.map((faq, i) => (
                                <AccordionItem key={i} value={`item-${idx}-${i}`}>
                                    <AccordionTrigger className="text-left font-medium text-lg hover:no-underline hover:text-primary transition-colors py-5">
                                        {faq.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5 pt-0 text-base">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                ))}
            </div>
        </div>
    );
}
