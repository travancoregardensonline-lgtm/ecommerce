"use client";

import { useState, useEffect } from "react";
import { Loader2, Upload, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateBanner, useUpdateBanner } from "@/hooks/useSupabase";
import { uploadToCloudinary } from "@/lib/cloudinary";

export function BannerModal({
    isOpen,
    onClose,
    banner = null,
}: {
    isOpen: boolean;
    onClose: () => void;
    banner?: any | null;
}) {
    const createBanner = useCreateBanner();
    const updateBanner = useUpdateBanner();

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [formData, setFormData] = useState({
        title: "",
        subtitle: "",
        description: "",
        button_text: "Start Shopping",
        button_link: "/shop",
        is_active: true,
    });

    useEffect(() => {
        if (banner) {
            setFormData({
                title: banner.title ?? "",
                subtitle: banner.subtitle ?? "",
                description: banner.description ?? "",
                button_text: banner.button_text ?? "Start Shopping",
                button_link: banner.button_link ?? "/shop",
                is_active: banner.is_active ?? true,
            });
            setImageUrl(banner.image_url ?? "");
        } else {
            setFormData({
                title: "",
                subtitle: "",
                description: "",
                button_text: "Start Shopping",
                button_link: "/shop",
                is_active: true,
            });
            setImageUrl("");
        }
    }, [banner, isOpen]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploading(true);
        try {
            const uploadedUrl = await uploadToCloudinary(e.target.files[0]);
            setImageUrl(uploadedUrl);
        } catch (err: any) {
            console.error("Upload error:", err);
            alert("Image upload failed: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                title: formData.title || null,
                subtitle: formData.subtitle || null,
                description: formData.description || null,
                button_text: formData.button_text || null,
                button_link: formData.button_link || null,
                image_url: imageUrl || null,
                is_active: formData.is_active,
            };

            if (banner?.id && banner.id !== "default") {
                await updateBanner.mutateAsync({ id: banner.id, updates: payload });
            } else {
                await createBanner.mutateAsync(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save banner.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{banner && banner.id !== "default" ? "Edit Banner" : "Create New Banner"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    {/* Image Upload Area */}
                    <div className="space-y-3 pb-2 border-b">
                        <Label>Banner Background Image</Label>
                        <div className="flex gap-4 items-start">
                            {imageUrl && (
                                <div className="relative w-40 h-24 border rounded-md bg-muted group">
                                    <img src={imageUrl} alt="upload" className="w-full h-full object-cover rounded-md" />
                                    <button
                                        type="button"
                                        className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => setImageUrl("")}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                            <label className="w-40 h-24 border-2 border-dashed border-muted-foreground/30 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors relative">
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                {isUploading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                                        <span className="text-[10px] text-muted-foreground font-medium">Upload Hero</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Hero Title (Supports HTML like &lt;br/&gt; or spans)</Label>
                        <textarea
                            className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder='Breathe <br /> <span class="text-primary italic font-serif lowercase font-medium">Life</span> Into <br /> Your Space.'
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Subtitle (Eyebrow Text)</Label>
                            <Input
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                placeholder="Premium Nursery"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Expertly curated indoor & outdoor plants..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Button Text</Label>
                            <Input
                                value={formData.button_text}
                                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                placeholder="Start Shopping"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Button Redirect Link</Label>
                            <Input
                                value={formData.button_link}
                                onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                                placeholder="/shop"
                            />
                        </div>

                        <div className="space-y-2 col-span-2 pt-2">
                            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer w-max">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="accent-primary w-4 h-4 cursor-pointer"
                                />
                                Active (Show in slider)
                            </label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading || isUploading || !formData.title || !imageUrl}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Banner
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
