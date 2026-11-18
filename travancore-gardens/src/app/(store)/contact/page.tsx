"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, ShieldCheck, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            toast.success("Thank you! Your message has been sent to our plant experts.");
        }, 800);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-6xl">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                    Customer Support &amp; Enquiries
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mt-3 mb-4 tracking-tight">
                    Contact Travancore Gardens
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Have questions about your order, tracking, bulk purchases, or shipping? Our customer care team is always ready to assist you.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Contact Form (7 cols) */}
                <div className="lg:col-span-7 bg-card border rounded-2xl p-6 sm:p-10 shadow-sm">
                    <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
                    <p className="text-sm text-muted-foreground mb-8">
                        Fill in your details and we&apos;ll get back to you within 24 operational hours.
                    </p>

                    {submitted ? (
                        <div className="py-12 text-center space-y-4">
                            <div className="h-14 w-14 bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Message Received!</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Thank you for contacting us. Our support desk has logged your request and an agent will reply to <strong>{formData.email}</strong> shortly.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSubmitted(false);
                                    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
                                }}
                            >
                                Send Another Message
                            </Button>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Rahul Sharma"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone / WhatsApp</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    placeholder="Order Inquiry / Plant Health / General Question"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message *</Label>
                                <textarea
                                    id="message"
                                    rows={5}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    placeholder="Please provide order number if inquiring about a purchase..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold" disabled={loading}>
                                <Send className="h-4 w-4 mr-2" />
                                {loading ? "Sending..." : "Send Message"}
                            </Button>
                        </form>
                    )}
                </div>

                {/* Contact Info (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
                    <div className="bg-muted/30 border rounded-2xl p-6 sm:p-8 space-y-6">
                        <div>
                            <h2 className="text-xl font-bold mb-1">Official Merchant Details</h2>
                            <p className="text-xs text-muted-foreground">Operating under registered commercial trade standards</p>
                        </div>

                        <div className="space-y-6 text-sm">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 text-primary">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Official Email</h3>
                                    <p className="text-muted-foreground mt-0.5">
                                        <a href="mailto:travancoregardensonline@gmail.com" className="text-primary font-medium hover:underline">
                                            travancoregardensonline@gmail.com
                                        </a>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Response within 24 business hours</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Operating &amp; Nursery Address</h3>
                                    <p className="text-muted-foreground leading-relaxed mt-0.5">
                                        <strong>Travancore Gardens</strong><br />
                                        Ambalathinkala, Kattakkada,<br />
                                        Thiruvananthapuram, Kerala – 695572,<br />
                                        India
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 text-primary">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Operational Hours</h3>
                                    <p className="text-muted-foreground mt-0.5">Monday to Saturday: 9:00 AM – 6:00 PM IST</p>
                                    <p className="text-xs text-muted-foreground">Sundays &amp; National Holidays: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grievance Redressal Card */}
                    <div className="border border-border/80 rounded-2xl p-6 bg-card">
                        <div className="flex items-center gap-2 mb-2 text-foreground font-semibold text-sm">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            Grievance Redressal
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            For escalation or unresolved grievances under the Consumer Protection (E-Commerce) Rules:
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            <strong>Officer:</strong> Grievance Officer, Travancore Gardens<br />
                            <strong>Email:</strong> travancoregardensonline@gmail.com<br />
                            <strong>Address:</strong> Ambalathinkala, Kattakkada, Kerala – 695572
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
