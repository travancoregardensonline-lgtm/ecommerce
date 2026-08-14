"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCategories, useCreateCategory, useUpdateCategory } from "@/hooks/useSupabase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Upload, X } from "lucide-react";

export function CategoryModal({
    isOpen,
    onClose,
    category = null,
}: {
    isOpen: boolean;
    onClose: () => void;
    category?: any | null;
}) {
    const { data: categories } = useCategories();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        image_url: "",
        parent_id: "",
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploading(true);
        try {
            const uploadedUrl = await uploadToCloudinary(e.target.files[0]);
            setFormData(prev => ({ ...prev, image_url: uploadedUrl }));
        } catch (err: any) {
            console.error("Upload error:", err);
            alert("Image upload failed: " + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name ?? "",
                slug: category.slug ?? "",
                description: category.description ?? "",
                image_url: category.image_url ?? "",
                parent_id: category.parent_id ?? "",
            });
        } else {
            setFormData({
                name: "",
                slug: "",
                description: "",
                image_url: "",
                parent_id: "",
            });
        }
    }, [category, isOpen]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const payload = {
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                description: formData.description || null,
                image_url: formData.image_url || null,
                parent_id: formData.parent_id === "none" || !formData.parent_id ? null : formData.parent_id,
            };

            if (category?.id) {
                await updateCategory.mutateAsync({ id: category.id, updates: payload });
            } else {
                await createCategory.mutateAsync(payload);
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save category.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 px-1">
                    <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Indoor Plants"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="indoor-plants"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Parent Category</Label>
                        <Select
                            value={formData.parent_id || "none"}
                            onValueChange={(v) => setFormData({ ...formData, parent_id: v === "none" ? "" : v })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Top Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Top Level (None)</SelectItem>
                                {(categories ?? [])
                                    .filter((c: any) => c.id !== category?.id)
                                    .map((cat: any) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Category Image</Label>
                        <div className="flex gap-4 items-center">
                            {formData.image_url ? (
                                <div className="relative w-24 h-24 border rounded bg-muted group">
                                    <img src={formData.image_url} alt="upload" className="w-full h-full object-cover rounded" />
                                    <button
                                        type="button"
                                        className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors bg-muted/20 relative">
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                    {isUploading ? (
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    ) : (
                                        <>
                                            <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                                            <span className="text-[10px] text-muted-foreground font-medium">Upload</span>
                                        </>
                                    )}
                                </label>
                            )}
                            <div className="flex-1 space-y-2">
                                <Label className="text-xs text-muted-foreground">Or enter URL manually:</Label>
                                <Input
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <textarea
                            className="w-full flex min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Short description..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading || isUploading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading || isUploading || !formData.name}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Category
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
