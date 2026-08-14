import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export interface Category {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
}

export function CategoryCard({ category }: { category: Category }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.4 }}
        >
            <Link
                href={`/shop?category=${category.slug}`}
                className="group relative flex h-72 w-full flex-col overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800 shadow-sm hover:shadow-xl transition-all duration-500"
            >
                <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                <div className="absolute bottom-0 left-0 p-8 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[10px] font-bold text-primary mb-2 uppercase tracking-[0.2em]">Explore</p>
                    <h3 className="text-2xl font-black text-white tracking-tight leading-none uppercase">
                        {category.name}
                    </h3>
                </div>
            </Link>
        </motion.div>
    );
}
