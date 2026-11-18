import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, ShieldCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    return (
        <footer className="bg-background border-t pt-16 pb-24 md:pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    {/* Brand (2 cols on lg) */}
                    <div className="space-y-4 lg:col-span-2">
                        <Link href="/" className="inline-flex items-center space-x-2.5 group">
                            <Image
                                src="/logo.png"
                                alt="Travancore Gardens Logo"
                                width={36}
                                height={36}
                                className="h-8 w-8 object-contain group-hover:scale-105 transition-transform"
                            />
                            <span className="text-xl font-bold font-heading text-foreground group-hover:text-primary transition-colors">
                                Travancore Gardens
                            </span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                            Bringing the lush beauty of nature into homes across India. Healthy indoor plants, rare tropical varieties, and botanical essentials delivered safely to your doorstep.
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                            <p><strong>Nursery &amp; Warehouse:</strong> Ambalathinkala, Kattakkada, Thiruvananthapuram, Kerala – 695572, India</p>
                            <p><strong>Email:</strong> <a href="mailto:support@travancoregardens.com" className="hover:text-primary transition-colors">support@travancoregardens.com</a></p>
                        </div>
                        <div className="flex space-x-4 pt-2">
                            <Button variant="ghost" size="icon" className="hover:text-primary" asChild>
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                    <Instagram className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:text-primary" asChild>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                    <Facebook className="h-5 w-5" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:text-primary" asChild>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                    <Twitter className="h-5 w-5" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground tracking-tight">Shop Categories</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    All Plants
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop?category=flowering-plants" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Flowering Plants
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop?category=fruits-plants" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Fruits Plants
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop?category=creeper-rose" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Creeper Rose
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop?category=rose-plants" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Rose Plants
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground tracking-tight">Customer Care</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/track-order" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Track Your Order
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Frequently Asked Questions
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    About Our Nursery
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Razorpay Mandatory Policy Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground tracking-tight flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-primary" /> Policies &amp; Terms
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Terms &amp; Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Cancellation &amp; Refund
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Shipping &amp; Delivery
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Merchant Contact Details
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Trust & Payment Gateways Banner */}
                <div className="border-t py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span>100% Secure Payments via <strong>Razorpay</strong> (UPI, Cards, NetBanking)</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-muted font-medium text-[11px]">UPI</span>
                        <span className="px-2 py-0.5 rounded bg-muted font-medium text-[11px]">Visa</span>
                        <span className="px-2 py-0.5 rounded bg-muted font-medium text-[11px]">MasterCard</span>
                        <span className="px-2 py-0.5 rounded bg-muted font-medium text-[11px]">RuPay</span>
                        <span className="px-2 py-0.5 rounded bg-muted font-medium text-[11px]">NetBanking</span>
                    </div>
                </div>

                {/* Bottom Legal Copyright */}
                <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Travancore Gardens. All rights reserved.</p>
                    <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link href="/refund-policy" className="hover:text-primary transition-colors">Refund Policy</Link>
                        <Link href="/shipping-policy" className="hover:text-primary transition-colors">Shipping Policy</Link>
                        <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
