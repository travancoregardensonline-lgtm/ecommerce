"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProductCard, Product } from "@/components/store/ProductCard";
import { CategoryCard } from "@/components/store/CategoryCard";
import { ArrowRight, Leaf, ShieldCheck, Truck, Loader2, Star, Instagram, ChevronRight, CheckCircle2 } from "lucide-react";
import { useCategories, useFeaturedProducts, useBanners } from "@/hooks/useSupabase";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: categories, isLoading: catLoading } = useCategories();
  const { data: featuredRaw, isLoading: prodLoading } = useFeaturedProducts(8);
  const { data: banners, isLoading: bannerLoading } = useBanners();
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const featuredProducts: Product[] = (featuredRaw ?? []).map((p: any) => {
    const primaryImage =
      p.product_images?.find((img: any) => img.is_primary)?.image_url ??
      p.product_images?.[0]?.image_url ??
      "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=600";
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      salePrice: p.sale_price ?? undefined,
      imageUrl: primaryImage,
      category: p.categories?.name ?? "",
    };
  });

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Cinematic Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
        {bannerLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {banners && banners.length > 0 && (
              <motion.div
                key={currentBannerIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-x-0 top-0 h-full z-0">
                  <Image
                    src={banners[currentBannerIndex].image_url || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600"}
                    alt={banners[currentBannerIndex].title}
                    fill
                    className="object-cover brightness-[0.85] saturate-[1.1]"
                    priority
                  />
         </div>

                <div className="container mx-auto relative z-10 px-4 sm:px-6 lg:px-8 h-full flex items-center">
                  <div className="max-w-4xl">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    >
                      <div className="flex items-center gap-2 mb-6">
                        <span className="h-px w-12 bg-primary"></span>
                        <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">{banners[currentBannerIndex].subtitle}</span>
                      </div>
                      <h1
                        className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[0.95] drop-shadow-2xl"
                        dangerouslySetInnerHTML={{ __html: banners[currentBannerIndex].title }}
                      />
                      <p className="mt-4 max-w-xl text-lg sm:text-2xl text-white font-medium mb-12 drop-shadow-md leading-relaxed">
                        {banners[currentBannerIndex].description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-6">
                        <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/20 h-16 px-10 text-lg rounded-full font-bold transition-all hover:scale-105 active:scale-95" asChild>
                          <Link href={banners[currentBannerIndex].button_link || "/shop"}>{banners[currentBannerIndex].button_text || "Shop Now"} <ChevronRight className="ml-2 h-5 w-5" /></Link>
                        </Button>
                        <Button size="lg" variant="outline" className="text-white border-white/40 backdrop-blur-md bg-white/10 hover:bg-white/20 h-16 px-10 text-lg rounded-full font-bold transition-all" asChild>
                          <Link href="/about">Our Story</Link>
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Carousel Indicators (only show if multiple banners) */}
        {banners && banners.length > 1 && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBannerIndex(i)}
                className={`transition-all h-2 rounded-full ${i === currentBannerIndex ? "w-8 bg-primary" : "w-2 bg-white/50 hover:bg-white"}`}
              />
            ))}
          </div>
        )}

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden sm:block"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-1 uppercase text-[8px] font-black tracking-widest text-white/50">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce mt-1"></div>
          </div>
        </motion.div>
      </section>

      {/* Trust Line & Stats */}
      <section className="py-20 relative z-10 -mt-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center bg-white dark:bg-zinc-900 shadow-2xl rounded-[3rem] p-12 md:p-16 border border-zinc-100 dark:border-zinc-800">
            {[
              { icon: Leaf, title: "Nature's Best", desc: "Every plant is hand-selected and nurtured by experts." },
              { icon: Truck, title: "Eco Shipping", desc: "Special 100% sustainable packaging for zero damage arrival." },
              { icon: Star, title: "Expert Care", desc: "Lifetime growth support and detailed guides for every purchase." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center group"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 transform group-hover:rotate-6">
                  <f.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white uppercase tracking-tight">{f.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[250px]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Modern Display */}
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4">
            <div>
              <span className="text-primary font-black uppercase text-xs tracking-widest mb-3 block">Collections</span>
              <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white leading-tight">Expertly Curated <br /> Categories</h2>
            </div>
            <Link href="/shop" className="group flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest hover:gap-4 transition-all">
              View All Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {catLoading ? (
            <div className="flex justify-center h-40 items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(categories as any[] ?? []).slice(0, 3).map((cat: any) => (
                <CategoryCard key={cat.id} category={{ id: cat.id, name: cat.name, slug: cat.slug, imageUrl: cat.image_url ?? "https://images.unsplash.com/photo-1485955900006-10f4d324d411" }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Bestsellers */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900 border-y border-zinc-100 dark:border-zinc-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-black uppercase text-xs tracking-widest mb-3 block">Trending Now</span>
            <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white">Shop Best Sellers</h2>
          </div>

          {prodLoading ? (
            <div className="flex justify-center h-48 items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : !featuredProducts.length ? (
            <div className="text-center py-20 border-2 border-dashed rounded-[3rem] border-zinc-200">
              <Leaf className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Our nursery is currently restocking...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="mt-20 text-center">
            <Button size="lg" variant="outline" className="rounded-full h-14 px-10 font-bold uppercase tracking-widest text-xs border-2 hover:bg-zinc-100 transition-all active:scale-95" asChild>
              <Link href="/shop">Explore Entire Shop</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Split CTA / Instagram Section */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[3rem] overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1000"
                alt="Plant care"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-primary/20 hover:bg-transparent transition-colors duration-700" />
            </motion.div>

            <div className="space-y-8">
              <span className="bg-primary/10 text-primary font-black px-4 py-2 rounded-full uppercase text-[10px] tracking-widest">Sustainability First</span>
              <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white leading-tight">Plants That Do <br /> Good For You.</h2>
              <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Our mission is to bridge the gap between urban living and nature. We use organic fertilizers, plastic-free packaging, and provide a 30-day health guarantee for all greenery.
              </p>

              <div className="space-y-4">
                {[
                  "30-Day Health Guarantee",
                  "Direct from Greenhouse",
                  "Biodegradable Packaging",
                  "Expert Support Line"
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="font-bold text-zinc-700 dark:text-zinc-200">{item}</span>
                  </div>
                ))}
              </div>

              <Button size="lg" className="h-16 px-10 rounded-full font-bold uppercase tracking-widest text-xs" asChild>
                <Link href="/about">Learn More About Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 bg-primary dark:bg-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-7xl font-black mb-8 leading-tight">Join Our Green <br /> Community.</h2>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-12">
            Subscribe for plant care tips, exclusive nursery updates, and 10% off your first order.
          </p>

          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-16 rounded-full px-8 bg-white/10 border border-white/20 backdrop-blur-md text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <Button className="h-16 px-10 rounded-full bg-white text-primary hover:bg-zinc-100 font-black uppercase tracking-widest text-xs">
              Subscribe
            </Button>
          </div>

          <div className="mt-12 flex justify-center gap-8 opacity-60">
            <Link href="#" className="hover:opacity-100 transition-opacity flex items-center gap-2 font-bold tracking-widest text-[10px] uppercase">
              <Instagram className="h-4 w-4" /> Instagram
            </Link>
            <Link href="#" className="hover:opacity-100 transition-opacity flex items-center gap-2 font-bold tracking-widest text-[10px] uppercase">
              Facebook
            </Link>
            <Link href="#" className="hover:opacity-100 transition-opacity flex items-center gap-2 font-bold tracking-widest text-[10px] uppercase">
              Pinterest
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
