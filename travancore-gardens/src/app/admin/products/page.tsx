"use client";

import { Plus, Search, Filter, Loader2, Package, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { useAdminProducts, useDeleteProduct } from "@/hooks/useSupabase";
import { useState } from "react";
import { ProductModal } from "@/components/admin/ProductModal";

export default function AdminProductsPage() {
    const { data: products = [], isLoading } = useAdminProducts();
    const deleteProduct = useDeleteProduct();
    const [search, setSearch] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            try {
                await deleteProduct.mutateAsync(id);
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Failed to delete product. It may have existing orders.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Products {products.length > 0 && `(${products.length})`}</h1>
                    <p className="text-muted-foreground mt-1">Manage your store&apos;s inventory and product listings.</p>
                </div>
                <Button className="shrink-0 gap-2" onClick={handleAdd}>
                    <Plus className="h-4 w-4" /> Add Product
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products by name or SKU..."
                        className="pl-9 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="shrink-0 gap-2">
                    <Filter className="h-4 w-4" /> Filters
                </Button>
            </div>

            <div className="border rounded-md bg-background min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No products found</h3>
                        <p className="text-muted-foreground max-w-xs">You haven&apos;t added any products yet or the database is empty.</p>
                        <Button className="mt-4" onClick={handleAdd}>Add the First Product</Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map((product: any) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-md bg-muted shrink-0 hidden sm:block overflow-hidden relative font-medium flex items-center justify-center">
                                                {product.product_images && product.product_images.length > 0 ? (
                                                    <img src={product.product_images[0]?.image_url} alt={product.name} className="h-full w-full object-cover absolute inset-0" />
                                                ) : (
                                                    <Package className="h-5 w-5 text-muted-foreground/50" />
                                                )}
                                            </div>
                                            {product.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{product.sku ?? "N/A"}</TableCell>
                                    <TableCell>{product.categories?.name ?? "Uncategorized"}</TableCell>
                                    <TableCell>₹{product.price.toLocaleString("en-IN")}</TableCell>
                                    <TableCell>
                                        <span className={product.stock === 0 ? "text-destructive font-medium" : ""}>
                                            {product.stock}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${product.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500'
                                            }`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(product.id, product.name)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
            />
        </div>
    );
}
