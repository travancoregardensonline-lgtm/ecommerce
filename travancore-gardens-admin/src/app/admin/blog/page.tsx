"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Calendar, Eye, Loader2, BookOpen } from "lucide-react";
import { useAdminBlogPosts, useDeleteBlogPost } from "@/hooks/useSupabase";
import { BlogModal } from "@/components/admin/BlogModal";

export default function AdminBlogPage() {
    const { data: posts = [], isLoading } = useAdminBlogPosts();
    const deletePost = useDeleteBlogPost();

    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<any | null>(null);

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const handleEdit = (p: any) => {
        setEditingPost(p);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Delete blog post "${title}"?`)) {
            await deletePost.mutateAsync(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Blog CMS</h1>
                    <p className="text-muted-foreground mt-1">Manage your journal posts and content.</p>
                </div>
                <Button className="gap-2 shrink-0" onClick={handleAdd}><Plus className="h-4 w-4" /> New Post</Button>
            </div>

            <div className="flex gap-3">
                <Input placeholder="Search posts..." className="max-w-sm bg-background" value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="bg-card border rounded-xl overflow-hidden min-h-[300px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[300px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No blog posts found</h3>
                        <Button className="mt-4" onClick={handleAdd}>Write First Post</Button>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                {["Title", "Status", "Date", "Cover", "Actions"].map(h => (
                                    <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredPosts.map((post: any) => (
                                <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-4 py-3 font-medium max-w-xs " title={post.title}>
                                        <p className="truncate font-bold mb-1">{post.title}</p>
                                        <p className="truncate text-xs text-muted-foreground font-normal">{post.excerpt}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${post.is_published ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"}`}>
                                            {post.is_published ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground flex items-center gap-1 mt-2 mb-2"><Calendar className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        {post.cover_image ? (
                                            <div className="h-10 w-16 bg-muted rounded overflow-hidden">
                                                <img src={post.cover_image} alt="cover" className="w-full h-full object-cover" />
                                            </div>
                                        ) : "None"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>Edit</Button>
                                            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(post.id, post.title)}>Delete</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <BlogModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} post={editingPost} />
        </div>
    );
}
