"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, ImageIcon, Trash2, Copy, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMediaLibrary } from "@/hooks/useSupabase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export default function MediaLibraryPage() {
    const { data: mediaItems = [], isLoading } = useMediaLibrary();
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<string[]>([]);
    const [search, setSearch] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const toggleSelect = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploading(true);
        try {
            const files = Array.from(e.target.files);
            const urls = await Promise.all(files.map(f => uploadToCloudinary(f)));

            // Insert orphaned images so they appear in library
            const supabase = createClient();
            const { error } = await supabase.from("product_images").insert(
                urls.map(url => ({ image_url: url, product_id: null }))
            );
            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ["media-library"] });
        } catch (err: any) {
            console.error(err);
            alert("Upload failed: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const filteredMediaItems = mediaItems.filter((m: any) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Media Library</h1>
                    <p className="text-muted-foreground mt-1">Manage your store&apos;s image assets natively.</p>
                </div>
                <Button className="gap-2 shrink-0" onClick={() => alert("Upload feature needs cloud integration (e.g., Cloudinary/S3 bucket) to store files securely.")}>
                    <Upload className="h-4 w-4" /> Upload Images
                </Button>
            </div>

            {/* Upload Area */}
            <label className={`border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20 flex flex-col items-center justify-center ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <p className="font-medium text-lg mb-1">Uploading...</p>
                    </div>
                ) : (
                    <>
                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="font-medium text-lg mb-1">Click to browse or drop images here</p>
                        <p className="text-sm text-muted-foreground mb-4">Supports JPG, PNG, WebP. Direct Cloudinary sync.</p>
                        <Button variant="outline" type="button" className="pointer-events-none">Browse Files</Button>
                    </>
                )}
            </label>

            <div className="flex gap-3 items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search media..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {selected.length > 0 && (
                    <Button variant="destructive" size="sm" className="gap-1" onClick={() => alert("Deleting needs cascade removals of linked DB records.")}>
                        <Trash2 className="h-4 w-4" /> Delete ({selected.length})
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredMediaItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No media found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {filteredMediaItems.map((item: any) => (
                        <div
                            key={item.id}
                            className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${selected.includes(item.id) ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-border"}`}
                            onClick={() => toggleSelect(item.id)}
                        >
                            <div className="aspect-square relative bg-muted">
                                <Image src={item.url} alt={item.name} fill className="object-cover" sizes="200px" />
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button
                                    className="h-8 w-8 bg-white rounded-full flex items-center justify-center shadow text-foreground hover:scale-105 transition-transform"
                                    onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.url); }}
                                >
                                    <Copy className="h-4 w-4" />
                                </button>
                            </div>
                            {selected.includes(item.id) && (
                                <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">✓</span>
                                </div>
                            )}
                            <div className="p-2 bg-card border-t">
                                <p className="text-xs font-medium truncate">{item.name}</p>
                                <p className="text-[10px] text-muted-foreground">{item.size}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
