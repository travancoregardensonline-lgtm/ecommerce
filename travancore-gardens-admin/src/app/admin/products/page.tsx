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
import {
    Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";

import { useAdminProducts, useDeleteProduct, useCreateProduct } from "@/hooks/useSupabase";
import { useState } from "react";
import { ProductModal } from "@/components/admin/ProductModal";

export default function AdminProductsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    
    const { data: { products = [], total = 0 } = {}, isLoading } = useAdminProducts(page, 10, search);
    const deleteProduct = useDeleteProduct();
    const createProduct = useCreateProduct();
    const [isSeeding, setIsSeeding] = useState(false);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);

    // Local filtering removed in favor of server-side search
    const filteredProducts = products;

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

    const handleSeed = async () => {
        if (confirm("Are you sure you want to add 15 mock products?")) {
            setIsSeeding(true);
            try {
                for (let i = 1; i <= 15; i++) {
                    const randomNum = Math.floor(Math.random() * 10000);
                    await createProduct.mutateAsync({
                        product: {
                            name: `Mock Pagination Plant ${randomNum} - ${i}`,
                            slug: `mock-pagination-plant-${randomNum}-${i}`,
                            description: 'This is a mock product generated to test pagination features in the admin dashboard and shop.',
                            price: Math.floor(Math.random() * 1000) + 100,
                            stock: Math.floor(Math.random() * 50) + 10,
                            is_active: true,
                            sku: `MOCK-PG-${randomNum}-${i}`
                        },
                        image_urls: ['https://images.pexels.com/photos/6913087/pexels-photo-6913087.jpeg?auto=compress&cs=tinysrgb&w=600']
                    });
                }
                alert("Successfully added 15 mock products!");
            } catch (err) {
                console.error("Failed to seed", err);
                alert("Failed to seed products.");
            } finally {
                setIsSeeding(false);
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
                <div className="flex gap-2">
                    <Button variant="secondary" className="shrink-0 gap-2" onClick={handleSeed} disabled={isSeeding}>
                        {isSeeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />} Seed 15 Products
                    </Button>
                    <Button className="shrink-0 gap-2" onClick={handleAdd}>
                        <Plus className="h-4 w-4" /> Add Product
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search products by name or SKU..."
                        className="pl-9 bg-background"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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

            {/* Pagination */}
            {total > 10 && (
                <div className="flex justify-center mt-6">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            
                            {Array.from({ length: Math.ceil(total / 10) }).map((_, i) => {
                                const pageNum = i + 1;
                                const totalPages = Math.ceil(total / 10);
                                
                                if (
                                    pageNum === 1 || 
                                    pageNum === totalPages ||
                                    (pageNum >= page - 1 && pageNum <= page + 1)
                                ) {
                                    return (
                                        <PaginationItem key={pageNum}>
                                            <PaginationLink 
                                                isActive={page === pageNum}
                                                onClick={() => setPage(pageNum)}
                                                className="cursor-pointer"
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                }
                                if (pageNum === page - 2 || pageNum === page + 2) {
                                    return (
                                        <PaginationItem key={pageNum}>
                                            <PaginationEllipsis />
                                        </PaginationItem>
                                    );
                                }
                                return null;
                            })}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(p => Math.min(Math.ceil(total / 10), p + 1))}
                                    className={page >= Math.ceil(total / 10) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
            />
        </div>
    );
}
