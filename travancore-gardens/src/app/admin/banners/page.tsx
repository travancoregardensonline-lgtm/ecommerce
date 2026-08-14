"use client";

import { useState } from "react";
import { Plus, Image as ImageIcon, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminBanners, useDeleteBanner } from "@/hooks/useSupabase";
import { BannerModal } from "@/components/admin/BannerModal";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminBannersPage() {
    const { data: banners, isLoading } = useAdminBanners();
    const deleteBanner = useDeleteBanner();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<any>(null);

    const handleCreate = () => {
        setSelectedBanner(null);
        setIsModalOpen(true);
    };

    const handleEdit = (banner: any) => {
        setSelectedBanner(banner);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;
        try {
            await deleteBanner.mutateAsync(id);
            toast.success("Banner deleted successfully!");
        } catch (error) {
            toast.error("Failed to delete banner.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight flex items-center gap-2">
                        <ImageIcon className="h-8 w-8 text-primary" /> Banners & Offers
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage the cinematic homepage hero slider and promotional offers.</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Banner
                </Button>
            </div>

            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/20">
                    <h2 className="font-semibold">Live Carousel Previews</h2>
                </div>
                {isLoading ? (
                    <div className="flex justify-center h-64 items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !banners || banners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-muted/5">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="font-semibold text-lg">No banners found</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">Create your first banner to display promotions and beautiful imagery on the homepage.</p>
                        <Button onClick={handleCreate}>Create Banner</Button>
                    </div>
                ) : (
                    <div className="divide-y">
                        {banners.map((banner: any, index: number) => (
                            <div key={banner.id || "default"} className="p-6 flex flex-col lg:flex-row gap-6 hover:bg-muted/5 transition-colors">
                                {/* Preview Card */}
                                <div className="relative w-full lg:w-[400px] aspect-[16/9] rounded-xl overflow-hidden border shadow-sm shrink-0">
                                    <Image
                                        src={banner.image_url || "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1600"}
                                        alt={banner.title || "Banner"}
                                        fill
                                        className="object-cover brightness-[0.80] saturate-[1.1]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

                                    {/* Mini mockup inside the box */}
                                    <div className="absolute inset-x-0 bottom-4 px-4">
                                        <span className="text-primary font-bold tracking-widest uppercase text-[8px] mb-1 block">
                                            {banner.subtitle || "Eyebrow text"}
                                        </span>
                                        <h3
                                            className="text-white font-black text-xl leading-tight mb-2"
                                            dangerouslySetInnerHTML={{ __html: banner.title || "Title" }}
                                        />
                                        <Button size="sm" className="h-6 text-[10px] px-3 pointer-events-none rounded-full">
                                            {banner.button_text}
                                        </Button>
                                    </div>

                                    {/* Slide Number */}
                                    <div className="absolute top-3 left-3 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                                        Slide {index + 1}
                                    </div>

                                    {/* Status Indicator */}
                                    {!banner.is_active && (
                                        <div className="absolute top-3 right-3 bg-destructive/90 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                                            Hidden
                                        </div>
                                    )}
                                </div>

                                {/* Details & Actions */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-1">Headline HTML</p>
                                                <div className="font-mono text-xs bg-muted p-2 rounded-md break-all">
                                                    {banner.title}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-1">Description</p>
                                                <p className="text-muted-foreground">{banner.description}</p>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-1">Button Action</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{banner.button_text}</span>
                                                    <span className="text-muted-foreground">→ {banner.button_link}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleEdit(banner)}
                                            disabled={banner.id === "default"}
                                            className="gap-1"
                                        >
                                            <Pencil className="h-3 w-3" /> Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(banner.id)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                                            disabled={banner.id === "default"}
                                        >
                                            <Trash2 className="h-3 w-3" /> Delete
                                        </Button>
                                    </div>

                                    {banner.id === "default" && (
                                        <p className="text-xs text-yellow-500 mt-2 text-right">You cannot edit the default banner view. Create a new banner to override it.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <BannerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                banner={selectedBanner}
            />
        </div>
    );
}
