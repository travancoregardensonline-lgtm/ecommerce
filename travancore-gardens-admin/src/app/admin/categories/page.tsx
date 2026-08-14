"use client";

import { Plus, Search, Edit2, Trash2, Loader2, Tags } from "lucide-react";
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
import { useState } from "react";
import { useCategories, useDeleteCategory } from "@/hooks/useSupabase";
import { CategoryModal } from "@/components/admin/CategoryModal";

export default function AdminCategoriesPage() {
    const { data: categories = [], isLoading } = useCategories();
    const deleteCategory = useDeleteCategory();
    const [search, setSearch] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);

    const filteredCategories = categories.filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug?.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete "${name}"? This will fail if products are linked to this category.`)) {
            try {
                await deleteCategory.mutateAsync(id);
            } catch (err) {
                console.error(err);
                alert("Failed to delete category. Ensure no products are using it.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">Categories {categories.length > 0 && `(${categories.length})`}</h1>
                    <p className="text-muted-foreground mt-1">Organize your products into meaningful categories.</p>
                </div>
                <Button className="shrink-0 gap-2" onClick={handleAdd}>
                    <Plus className="h-4 w-4" /> Add Category
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search categories..."
                        className="pl-9 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-md bg-background min-h-[400px]">
                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <Tags className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No categories found</h3>
                        <Button className="mt-4" onClick={handleAdd}>Add the First Category</Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Parent Category</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category: any) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            {category.image_url ? (
                                                <div className="h-8 w-8 rounded-md bg-muted shrink-0 hidden sm:block overflow-hidden relative">
                                                    <img src={category.image_url} alt={category.name} className="object-cover w-full h-full" />
                                                </div>
                                            ) : (
                                                <div className="h-8 w-8 rounded-md bg-muted shrink-0 hidden sm:block"></div>
                                            )}
                                            {category.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {category.parent ? (
                                            <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-secondary-foreground/10">{category.parent.name}</span>
                                        ) : "—"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(category.id, category.name)}>
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

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={editingCategory}
            />
        </div>
    );
}
