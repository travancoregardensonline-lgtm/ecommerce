import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: post } = await supabase.from("blog_posts").select("title, excerpt").eq("slug", slug).single();

    if (!post) return { title: "Post Not Found" };
    return { title: `${post.title} | Travancore Journal`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: post, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

    if (error || !post) {
        return notFound();
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-3xl">
            <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Journal
            </Link>

            {post.category && (
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4 w-fit">
                    {post.category}
                </span>
            )}

            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 tracking-tight leading-tight">
                {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-10 pb-10 border-b">
                <span className="flex items-center gap-1.5 border border-muted-foreground/30 px-2 py-1 rounded-md">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                {post.read_time && (
                    <span className="flex items-center gap-1.5 border border-muted-foreground/30 px-2 py-1 rounded-md">
                        <Clock className="h-4 w-4" />
                        {post.read_time}
                    </span>
                )}
            </div>

            {post.image_url && (
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-12 shadow-sm border border-border/40">
                    <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, 800px"
                    />
                </div>
            )}

            <div className="prose prose-green prose-lg max-w-none text-foreground prose-img:rounded-xl prose-img:shadow-sm"
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
            />

            <div className="mt-16 pt-10 border-t flex items-center justify-between text-sm text-muted-foreground">
                <Link href="/blog" className="font-medium hover:text-primary flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" /> Go back
                </Link>
                <p>Travancore Gardens Journal</p>
            </div>
        </div>
    );
}
