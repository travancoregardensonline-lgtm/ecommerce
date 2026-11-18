import Image from "next/image";
import Link from "next/link";
import {
    Leaf,
    Truck,
    ShieldCheck,
    Heart,
    MapPin,
    Sparkles,
    ArrowRight,
    Sun,
    Droplets,
    Award,
    MessageCircle,
    CheckCircle2,
    Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    return (
        <div className="relative overflow-hidden bg-background">
            {/* Ambient Botanical Backdrop Gradients */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-full max-w-7xl bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-primary/5 to-transparent blur-3xl opacity-70" />
            <div className="pointer-events-none absolute top-[800px] -left-48 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
            <div className="pointer-events-none absolute top-[1400px] -right-48 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />

            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24 max-w-6xl">
                {/* ── 1. Hero: Brand Emblem & Editorial Title ── */}
                <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24 space-y-6">
                    {/* Official Logo Medallion */}
                    <div className="relative inline-flex items-center justify-center p-3 sm:p-4 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-primary/25 shadow-xl shadow-primary/10 ring-8 ring-primary/5">
                        <Image
                            src="/logo.png"
                            alt="Travancore Gardens Crest"
                            width={110}
                            height={110}
                            className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow"
                            priority
                        />
                        <div className="absolute -bottom-2.5 bg-primary text-white text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md">
                            Kerala · Est. 2021
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                            <Sparkles className="h-3.5 w-3.5" />
                            Direct from the Cradle of Botanicals
                        </span>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-heading tracking-tight text-foreground leading-[1.1]">
                            The Art of Living with{" "}
                            <span className="font-serif italic font-normal text-primary">
                                Nature
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto pt-1">
                            Born amidst the lush landscapes of Kattakkada, Kerala, Travancore Gardens connects homes across India to rare tropical flora, fragrant heirloom roses, and vital indoor greens.
                        </p>
                    </div>

                    {/* Stats Ribbon */}
                    <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
                        {[
                            { value: "50,000+", label: "Plants Nurtured" },
                            { value: "70+", label: "Rare Varieties" },
                            { value: "100%", label: "Live Arrival Promise" },
                            { value: "4.9 ★", label: "Customer Rating" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="p-3.5 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-sm text-center"
                            >
                                <p className="text-xl sm:text-2xl font-black text-primary font-heading tracking-tight">
                                    {stat.value}
                                </p>
                                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                                    {stat.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── 2. Editorial Story: Asymmetrical Visual Collage ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-20 sm:mb-28">
                    {/* Visual Collage Column (5 cols) */}
                    <div className="lg:col-span-5 relative">
                        {/* Main Nursery Frame */}
                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-border/80">
                            <Image
                                src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1000"
                                alt="Lush botanical greenhouse at Travancore Gardens"
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Floating Logo Badge on Photo */}
                            <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-white/20 shadow-xl flex items-center gap-3">
                                <Image
                                    src="/logo.png"
                                    alt="Travancore Gardens"
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 object-contain shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-foreground leading-tight truncate">
                                        Travancore Gardens Nursery
                                    </p>
                                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                                        Ambalathinkala, Kattakkada, Kerala
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Decorative Plant Note */}
                        <div className="hidden sm:block absolute -top-5 -right-5 p-3.5 rounded-2xl bg-card border border-primary/20 shadow-xl max-w-[200px]">
                            <p className="text-[11px] font-bold text-primary flex items-center gap-1.5 mb-1">
                                <Leaf className="h-3.5 w-3.5" /> 100% Acclimated
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                Hardened in shade-houses for immediate home vitality.
                            </p>
                        </div>
                    </div>

                    {/* Story Prose Column (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="space-y-2">
                            <span className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
                                <Award className="h-3.5 w-3.5" /> CHAPTER I · OUR ROOTS
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight leading-tight">
                                Nurtured by Kerala Rains,{" "}
                                <span className="font-serif italic font-normal text-primary">
                                    Delivered with Care
                                </span>
                            </h2>
                        </div>

                        <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed">
                            <p>
                                Our story began with a quiet realization: the authentic, vibrant botanical life that flourishes in Kerala’s rich soil was rarely accessible to urban plant lovers across India without intermediaries, wilting, or disappointment.
                            </p>
                            <p>
                                We founded <strong className="text-foreground font-semibold">Travancore Gardens</strong> directly from our nursery grounds in Kattakkada, Thiruvananthapuram. Instead of mass-retail warehousing, each plant is tended individually by experienced horticulturists, nourished with organic matter, and acclimatized to ensure a smooth transition into your living room, balcony, or garden.
                            </p>
                            <p>
                                Whether it is the intoxicating scent of our heirloom creeper roses, the lush foliage of tropical monsteras, or heavy-bearing exotic fruit trees, every sapling carries the vitality of our soil directly into your home.
                            </p>
                        </div>

                        {/* Pull Quote Box */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border-l-4 border-primary space-y-1.5">
                            <p className="text-xs sm:text-sm font-medium italic text-foreground leading-relaxed">
                                &ldquo;We don&apos;t simply pack plants into boxes. We deliver living green sanctuaries that bring serenity, oxygen, and joy into everyday spaces.&rdquo;
                            </p>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                — The Nursery Stewards, Travancore Gardens
                            </p>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center gap-3">
                            <Button size="lg" className="rounded-xl font-bold text-xs sm:text-sm shadow-md" asChild>
                                <Link href="/shop">
                                    Browse Our Plants <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-xl font-bold text-xs sm:text-sm border-border"
                                asChild
                            >
                                <Link href="/contact">
                                    Get in Touch
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* ── 3. Soil to Sanctuary: Our 4-Step Botanical Standard ── */}
                <div className="mb-20 sm:mb-28">
                    <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14 space-y-2">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-primary">
                            Horticultural Craft
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                            From Our Soil to Your Sanctuary
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            How we guarantee that delicate live plants travel hundreds of kilometers and arrive flourishing.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[
                            {
                                step: "01",
                                icon: Leaf,
                                title: "Living Organic Soil",
                                desc: "Potted in nutrient-dense Kerala red loam, aged vermicompost, and cocopeat for deep root vigor.",
                            },
                            {
                                step: "02",
                                icon: Sun,
                                title: "Pre-Ship Hardening",
                                desc: "Each plant spends weeks in natural ambient shade-houses, preparing it to thrive in apartment lighting.",
                            },
                            {
                                step: "03",
                                icon: ShieldCheck,
                                title: "Phytosanitary Health Check",
                                desc: "Every sapling undergoes root-rot inspection, organic neem cleansing, and vitality screening before clearing for dispatch.",
                            },
                            {
                                step: "04",
                                icon: Truck,
                                title: "Direct Nursery Dispatch",
                                desc: "Dispatched fresh straight from our Kattakkada grounds with tailored unboxing guidance for a seamless home transition.",
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.step}
                                    className="group relative p-5 sm:p-6 rounded-3xl bg-card border border-border/70 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <span className="font-heading font-black text-xs text-muted-foreground/50 tracking-wider">
                                                {item.step}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                                            {item.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── 4. Bento Deck: Why Plant Lovers Trust Us ── */}
                <div className="p-6 sm:p-10 rounded-[2.5rem] bg-gradient-to-b from-card via-card to-muted/20 border border-border/70 shadow-sm mb-16 sm:mb-20">
                    <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary">
                            Guaranteed Vitality
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground tracking-tight">
                            Built on Trust &amp; Botanical Excellence
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="p-6 rounded-2xl bg-background/80 border border-border/60 space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <h4 className="font-bold text-base text-foreground">Authentic Cultivars</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                No mislabeled saplings. What you order is precisely the cultivar, color, and species you receive.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-background/80 border border-border/60 space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Sprout className="h-5 w-5" />
                            </div>
                            <h4 className="font-bold text-base text-foreground">100% Organic Nutrition</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                Nurtured with native cow-dung compost, bio-enzymes, and neem cakes. Zero synthetic growth hormones or toxic chemical residues.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-background/80 border border-border/60 space-y-3">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                <Heart className="h-5 w-5" />
                            </div>
                            <h4 className="font-bold text-base text-foreground">Horticulturist Care</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                From troubleshooting yellow leaves to repotting advice, you have a direct line to our Kerala nursery experts.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── 5. Nursery Hub & WhatsApp Banner ── */}
                <div className="relative overflow-hidden rounded-[2rem] border border-primary/25 bg-primary/5 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white dark:bg-zinc-900 border border-primary/20 flex items-center justify-center shrink-0 shadow-md">
                            <Image
                                src="/logo.png"
                                alt="Travancore Gardens"
                                width={44}
                                height={44}
                                className="h-10 w-10 sm:h-11 sm:w-11 object-contain"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5 text-primary text-xs font-extrabold uppercase tracking-wider mb-0.5">
                                <MapPin className="h-3.5 w-3.5" /> Direct Nursery &amp; Dispatch Hub
                            </div>
                            <h4 className="font-bold text-base sm:text-lg text-foreground">
                                Ambalathinkala, Kattakkada
                            </h4>
                            <p className="text-xs text-muted-foreground">
                                Thiruvananthapuram, Kerala – 695572, India
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <Button
                            size="lg"
                            className="w-full md:w-auto rounded-xl font-bold text-xs sm:text-sm bg-primary text-white shadow-md gap-2"
                            asChild
                        >
                            <a
                                href="https://wa.me/918590809000"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Chat with Nursery Expert
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
