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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCategories, useCreateProduct, useUpdateProduct } from "@/hooks/useSupabase";
import { uploadToCloudinary } from "@/lib/cloudinary";

export function ProductModal({
    isOpen,
    onClose,
    product = null,
}: {
    isOpen: boolean;
    onClose: () => void;
    product?: any | null;
}) {
    const { data: categories } = useCategories();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        sku: "",
        price: "",
        sale_price: "",
        stock: "",
        category_id: "",
        description: "",
        short_description: "",
        is_active: true,
        weight: "",
        height: "",
        width: "",
        length: "",
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name ?? "",
                slug: product.slug ?? "",
                sku: product.sku ?? "",
                price: product.price?.toString() ?? "",
                sale_price: product.sale_price?.toString() ?? "",
                stock: product.stock?.toString() ?? "",
                category_id: product.category_id ?? "",
                description: product.description ?? "",
                short_description: product.short_description ?? "",
                is_active: product.is_active ?? true,
                weight: product.weight?.toString() ?? "",
                height: product.height?.toString() ?? "",
                width: product.width?.toString() ?? "",
                length: product.length?.toString() ?? "",
            });
            // Extract images if they are populated
            const imgs = product.product_images?.map((p: any) => p.image_url) || [];
            setImageUrls(imgs);
        } else {
            setFormData({
                name: "",
                slug: "",
                sku: "",
                price: "",
                sale_price: "",
                stock: "",
                category_id: "",
                description: "",
                short_description: "",
                is_active: true,
                weight: "",
                height: "",
                width: "",
                length: "",
            });
            setImageUrls([]);
        }
    }, [product, isOpen]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setIsUploading(true);
        const files = Array.from(e.target.files);

        try {
            const uploadedUrls = await Promise.all(
                files.map(file => uploadToCloudinary(file))
            );
            setImageUrls(prev => [...prev, ...uploadedUrls]);
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
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                sku: formData.sku || `TG-${formData.name.substring(0, 3).toUpperCase().padEnd(3, 'X')}-${Math.floor(1000 + Math.random() * 9000)}`,
                price: parseFloat(formData.price) || 0,
                sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
                stock: parseInt(formData.stock) || 0,
                category_id: formData.category_id || null,
                description: formData.description || null,
                short_description: formData.short_description || null,
                is_active: formData.is_active,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                height: formData.height ? parseFloat(formData.height) : null,
                width: formData.width ? parseFloat(formData.width) : null,
                length: formData.length ? parseFloat(formData.length) : null,
            };

            if (product?.id) {
                await updateProduct.mutateAsync({ id: product.id, updates: payload, image_urls: imageUrls });
            } else {
                await createProduct.mutateAsync({ product: payload, image_urls: imageUrls });
            }
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save product.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    {/* Image Upload Area */}
                    <div className="space-y-3 pb-2 border-b">
                        <Label>Product Images (Cloudinary)</Label>
                        <div className="flex gap-4 flex-wrap">
                            {imageUrls.map((url, i) => (
                                <div key={i} className="relative w-24 h-24 border rounded-md bg-muted group">
                                    <img src={url} alt="upload" className="w-full h-full object-cover rounded-md" />
                                    <button
                                        type="button"
                                        className="absolute -top-2 -right-2 bg-destructive hover:bg-destructive/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => setImageUrls(prev => prev.filter((_, idx) => idx !== i))}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                            <label className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors relative">
                                <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                {isUploading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                ) : (
                                    <>
                                        <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                                        <span className="text-[10px] text-muted-foreground font-medium">Upload</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => {
                                    const newName = e.target.value;
                                    const autoSku = formData.sku || (newName.length >= 3 ? `TG-${newName.substring(0, 3).toUpperCase().padEnd(3, 'X')}-${Math.floor(1000 + Math.random() * 9000)}` : "");
                                    setFormData({
                                        ...formData,
                                        name: newName,
                                        sku: autoSku
                                    });
                                }}
                                placeholder="Product name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                placeholder="product-name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>SKU</Label>
                            <Input
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="SKU-123"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.category_id || "none"}
                                onValueChange={(v) => setFormData({ ...formData, category_id: v === "none" ? "" : v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {(categories ?? []).map((cat: any) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Price (₹) *</Label>
                            <Input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Sale Price (₹)</Label>
                            <Input
                                type="number"
                                value={formData.sale_price}
                                onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Stock *</Label>
                            <Input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Weight (kg)</Label>
                            <Input
                                type="number" step="0.01"
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Height (cm)</Label>
                            <Input
                                type="number" step="0.1"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Width (cm)</Label>
                            <Input
                                type="number" step="0.1"
                                value={formData.width}
                                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Length (cm)</Label>
                            <Input
                                type="number" step="0.1"
                                value={formData.length}
                                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2 col-span-2 flex flex-col justify-center pt-2">
                            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer w-max">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="accent-primary w-4 h-4 cursor-pointer"
                                />
                                Active (Visible in Store)
                            </label>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Short Description</Label>
                        <textarea
                            className="w-full flex min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            value={formData.short_description}
                            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                            placeholder="Brief summary..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <textarea
                            className="w-full flex min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detailed description of the plant..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading || isUploading || !formData.name || !formData.price}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Product
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
