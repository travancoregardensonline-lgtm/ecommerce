"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-6xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight">Contact Us</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Have a question about a plant? Need help with an order? We&apos;re here to help. Reach out to our team of plant experts.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                {/* Contact Form */}
                <div className="bg-card border rounded-2xl p-6 sm:p-10 shadow-sm">
                    <h2 className="text-2xl font-bold mb-8">Send us a Message</h2>
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" placeholder="Jane" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" placeholder="Doe" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="jane@example.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="How can we help you?" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <textarea
                                id="message"
                                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Write your message here..."
                            ></textarea>
                        </div>
                        <Button size="lg" className="w-full h-12 text-base">Send Message</Button>
                    </form>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col justify-center space-y-10">
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                        <p className="text-muted-foreground mb-8">Our customer service team is available Monday to Friday, 9:00 AM to 6:00 PM IST.</p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Call Us</h3>
                                <p className="text-muted-foreground line-clamp-2">+91 1800 123 4567</p>
                                <p className="text-sm text-muted-foreground mt-1">Toll-free across India</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Email Us</h3>
                                <p className="text-muted-foreground">support@travancoregardens.com</p>
                                <p className="text-sm text-muted-foreground mt-1">We aim to reply within 24 hours.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Visit Our Nursery</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    124 Green Valley Road,<br />
                                    Kochi, Kerala 682001<br />
                                    India
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
