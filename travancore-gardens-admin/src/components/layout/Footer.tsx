import Link from "next/link";
import { Facebook, Instagram, Twitter, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
    return (
        <footer className="bg-background border-t pt-16 pb-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Leaf className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold font-heading text-primary">
                                Travancore Gardens
                            </span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                            Bringing nature home. Premium indoor and outdoor plants, rare tropicals, and gardening essentials delivered across India.
                        </p>
                        <div className="flex space-x-4">
                            <Button variant="ghost" size="icon" className="hover:text-primary">
                                <Instagram className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:text-primary">
                                <Facebook className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:text-primary">
                                <Twitter className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground tracking-tight">Shop</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    All Plants
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop?category=indoor" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Indoor Plants
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop?category=outdoor" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Outdoor Plants
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop?category=accessories" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Pots & Accessories
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground tracking-tight">Support</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    FAQs
                                </Link>
                            </li>
                            <li>
                                <Link href="/track-order" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link href="/plant-care" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Plant Care Guide
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-foreground tracking-tight">Subscribe</h3>
                        <p className="text-sm text-muted-foreground">
                            Get 10% off your first order by subscribing to our newsletter.
                        </p>
                        <form className="flex space-x-2">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="max-w-[220px]"
                                required
                            />
                            <Button type="button">Subscribe</Button>
                        </form>
                    </div>
                </div>

                <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Travancore Gardens. All rights reserved.</p>
                    <div className="flex space-x-6">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
