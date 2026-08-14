import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// Try to fetch blog posts from a "blog_posts" table if it exists,
// else fall back to a CMS-ready empty state
async function getBlogPosts() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("blog_posts")
            .select("id, slug, title, excerpt, image_url, category, created_at, read_time")
            .eq("is_published", true)
            .order("created_at", { ascending: false })
            .limit(10);
        if (error) return [];
        return data ?? [];
    } catch {
        return [];
    }
}

export default async function BlogPage() {
    const posts = await getBlogPosts();

    if (!posts.length) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-6xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight">The Travancore Journal</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Plant care guides, décor tips, and stories from our nursery.
                    </p>
                </div>
                <div className="text-center py-24 border rounded-2xl text-muted-foreground">
                    <p className="text-lg font-medium mb-2">No blog posts published yet.</p>
                    <p className="text-sm">Add posts from the Admin → Blog CMS panel.</p>
                    <Link href="/admin/blog" className="inline-block mt-4 text-primary hover:underline font-medium">
                        Go to Blog CMS →
                    </Link>
                </div>
            </div>
        );
    }

    const [featured, ...rest] = posts;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-6xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight">The Travancore Journal</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Plant care guides, décor tips, and stories from our nursery. Grow with us.
                </p>
            </div>

            {/* Featured */}
            <Link href={`/blog/${featured.slug}`} className="group grid grid-cols-1 md:grid-cols-2 gap-0 rounded-2xl overflow-hidden border shadow-sm hover:shadow-lg transition-shadow mb-16">
                <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
                    <Image
                        src={featured.image_url ?? "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800"}
                        alt={featured.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
                <div className="p-8 md:p-12 bg-card flex flex-col justify-center">
                    {featured.category && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4 w-fit">
                            {featured.category}
                        </span>
                    )}
                    <h2 className="text-2xl md:text-3xl font-bold font-heading mb-4 group-hover:text-primary transition-colors">{featured.title}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">{featured.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(featured.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="text-primary font-medium flex items-center gap-1">Read More <ArrowRight className="h-4 w-4" /></span>
                    </div>
                </div>
            </Link>

            {/* Grid */}
            {rest.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {rest.map((post: any) => (
                        <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <Image
                                    src={post.image_url ?? "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800"}
                                    alt={post.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </div>
                            <div className="p-6">
                                {post.category && (
                                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary mb-3 w-fit">
                                        {post.category}
                                    </span>
                                )}
                                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>{new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                    {post.read_time && <span>{post.read_time}</span>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
