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
                q: "What if my plant arrives damaged?",
                a: "We have a 30-day guarantee. If your plant arrives damaged or dies within the first 30 days despite proper care, we will replace it for free."
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
        category: "Returns & Exchanges",
        questions: [
            {
                q: "Can I return a plant?",
                a: "Due to the perishable nature of plants, we do not accept returns. However, we do offer replacements under our 30-Day Guarantee if the plant arrives damaged."
            },
            {
                q: "Can I return accessories or pots?",
                a: "Yes, non-living items like pots, planters, and accessories can be returned within 14 days of delivery in their original, unused condition."
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
