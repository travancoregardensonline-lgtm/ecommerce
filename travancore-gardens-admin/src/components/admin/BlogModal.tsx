"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateBlogPost, useUpdateBlogPost } from "@/hooks/useSupabase";
import { uploadToCloudinary } from "@/lib/cloudinary";

export function BlogModal({ isOpen, onClose, post = null }: { isOpen: boolean; onClose: () => void; post?: any | null }) {
    const createPost = useCreateBlogPost();
    const updatePost = useUpdateBlogPost();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        cover_image: "",
        is_published: false
    });

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title || "",
                slug: post.slug || "",
                excerpt: post.excerpt || "",
                content: post.content || "",
                cover_image: post.cover_image || "",
                is_published: post.is_published ?? false
            });
        } else {
            setFormData({ title: "", slug: "", excerpt: "", content: "", cover_image: "", is_published: false });
        }
    }, [post, isOpen]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploading(true);
        try {
            const uploadedUrl = await uploadToCloudinary(e.target.files[0]);
            setFormData(prev => ({ ...prev, cover_image: uploadedUrl }));
        } catch (err: any) {
            console.error("Upload error:", err);
            alert("Image upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                title: formData.title,
                slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                excerpt: formData.excerpt,
                content: formData.content,
                cover_image: formData.cover_image,
                is_published: formData.is_published,
                published_at: formData.is_published ? (post?.published_at || new Date().toISOString()) : null
            };

            if (post?.id) {
                await updatePost.mutateAsync({ id: post.id, updates: payload });
            } else {
                await createPost.mutateAsync(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save post.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(o) => (!o && onClose())}>
            <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader><DialogTitle>{post ? "Edit Post" : "Write Blog Post"}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="space-y-2">
                        <Label>Cover Image</Label>
                        <div className="flex gap-4 items-center">
                            {formData.cover_image ? (
                                <div className="relative w-40 h-24 border rounded bg-muted group">
                                    <img src={formData.cover_image} alt="cover" className="w-full h-full object-cover rounded" />
                                    <button type="button" className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setFormData(prev => ({ ...prev, cover_image: "" }))}>
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="w-40 h-24 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                    {isUploading ? <Loader2 className="h-5 w-5 animate-spin text-muted" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Excerpt (Summary) *</Label>
                        <textarea className="w-full flex min-h-[60px] rounded-md border px-3 py-2 text-sm bg-transparent" value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />
                    </div>

                    <div className="space-y-2">
                        <Label>Content *</Label>
                        <textarea className="w-full flex min-h-[200px] rounded-md border px-3 py-2 text-sm bg-transparent" value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                    </div>

                    <label className="flex items-center gap-2 text-sm font-medium mt-4 cursor-pointer">
                        <input type="checkbox" checked={formData.is_published} onChange={e => setFormData({ ...formData, is_published: e.target.checked })} className="accent-primary w-4 h-4 cursor-pointer" />
                        Published (Live)
                    </label>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading || isUploading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading || isUploading || !formData.title || !formData.content}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Post
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
