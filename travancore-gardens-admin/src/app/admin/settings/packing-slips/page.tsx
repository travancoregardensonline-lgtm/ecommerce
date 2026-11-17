"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, GripVertical, Save, Printer } from "lucide-react";
import { toast } from "sonner";
import { usePrintTemplates, useUpdatePrintTemplate, useCreatePrintTemplate } from "@/hooks/useSupabase";
import { PrintRenderer, PrintTemplateConfig } from "@/components/print/PrintRenderer";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DEFAULT_ELEMENTS = [
    { id: "store_info", type: "store_info", enabled: true, title: "Store Information" },
    { id: "doc_title", type: "doc_title", enabled: true, title: "Document Title & Date" },
    { id: "shipping_address", type: "shipping_address", enabled: true, title: "Shipping Address" },
    { id: "billing_address", type: "billing_address", enabled: false, title: "Billing Address" },
    { id: "product_table", type: "product_table", enabled: true, title: "Product Table (Qty only)" },
    { id: "product_table_with_price", type: "product_table_with_price", enabled: false, title: "Product Table (Prices & Totals)" },
    { id: "totals", type: "totals", enabled: false, title: "Order Totals" },
    { id: "customer_notes", type: "customer_notes", enabled: true, title: "Customer Notes" },
    { id: "barcode", type: "barcode", enabled: false, title: "Order Barcode" }
];

const PRESETS = [
    { label: "A4", width: "210mm", height: "297mm", type: "A4" },
    { label: "Letter (8.5x11)", width: "8.5in", height: "11in", type: "letter" },
    { label: "4x6 Shipping Label", width: "4in", height: "6in", type: "4x6" },
    { label: "80mm Thermal Receipt", width: "80mm", height: "auto", type: "80mm" }
];

// Sample order for live preview
const MOCK_ORDER = {
    order_number: "ORD-98765432",
    created_at: new Date().toISOString(),
    total_amount: 1450,
    profiles: { name: "Arun Kumar", email: "arun.k@example.com", phone: "+91 98765 43210" },
    addresses: { full_name: "Arun Kumar", address_line1: "123 Green Street", city: "Kochi", state: "Kerala", pincode: "682011", phone: "+91 98765 43210" },
    order_items: [
        { quantity: 2, price: 350, products: { name: "Monstera Deliciosa", sku: "PL-MD-01" } },
        { quantity: 1, price: 750, products: { name: "Ceramic Planter - Large", sku: "AC-CP-L" } }
    ],
    notes: "Please leave the package at the front door."
};

function SortableElement({ item, onToggle }: { item: any, onToggle: (id: string, enabled: boolean) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md mb-2 shadow-sm">
            <div className="flex items-center gap-3">
                <button {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <GripVertical size={18} />
                </button>
                <span className="text-sm font-medium">{item.title}</span>
            </div>
            <Switch checked={item.enabled} onCheckedChange={(c) => onToggle(item.id, c)} />
        </div>
    );
}

export default function PackageSlipDesigner() {
    const { data: templates, isLoading } = usePrintTemplates("packing_slip");
    const updateTemplate = useUpdatePrintTemplate();
    const createTemplate = useCreatePrintTemplate();

    const [config, setConfig] = useState<PrintTemplateConfig>({
        paper_size: { width: "8.5in", height: "11in", orientation: "portrait" },
        margins: { top: 40, right: 40, bottom: 40, left: 40 },
        elements: DEFAULT_ELEMENTS
    });

    const [templateId, setTemplateId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (templates && templates.length > 0) {
            const def = templates.find((t: any) => t.is_default) || templates[0];
            setTemplateId(def.id);
            if (def.configuration) {
                // Merge database config with DEFAULT_ELEMENTS titles
                const mergedElements = (def.configuration.elements || []).map((el: any) => {
                    const match = DEFAULT_ELEMENTS.find(d => d.id === el.id);
                    return { ...match, ...el };
                });
                // Find any missing elements
                const missing = DEFAULT_ELEMENTS.filter(d => !mergedElements.some((m: any) => m.id === d.id));
                
                setConfig({
                    paper_size: def.configuration.paper_size || def.paper_size, // backward compat with db structure
                    margins: def.configuration.margins || def.margins,
                    elements: [...mergedElements, ...missing]
                });
            } else {
                setConfig({
                    paper_size: def.paper_size,
                    margins: def.margins,
                    elements: typeof def.elements === 'string' ? JSON.parse(def.elements) : def.elements
                });
            }
        }
    }, [templates]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setConfig((prev) => {
                const oldIndex = prev.elements.findIndex(e => e.id === active.id);
                const newIndex = prev.elements.findIndex(e => e.id === over.id);
                return { ...prev, elements: arrayMove(prev.elements, oldIndex, newIndex) };
            });
        }
    };

    const toggleElement = (id: string, enabled: boolean) => {
        setConfig(prev => ({
            ...prev,
            elements: prev.elements.map(e => e.id === id ? { ...e, enabled } : e)
        }));
    };

    const saveConfiguration = async () => {
        setIsSaving(true);
        try {
            const payload = {
                configuration: config, // We store the whole config as jsonb in 'configuration' column or 'elements'/'paper_size'
                paper_size: config.paper_size,
                margins: config.margins,
                elements: config.elements
            };
            
            if (templateId) {
                await updateTemplate.mutateAsync({ id: templateId, updates: payload });
            } else {
                await createTemplate.mutateAsync({ name: "Custom Layout", type: "packing_slip", is_default: true, ...payload });
            }
            toast.success("Template saved successfully");
        } catch (error) {
            toast.error("Failed to save template");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Package Slip Designer</h1>
                    <p className="text-muted-foreground">Drag and drop elements to customize your printable package slips.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Test Print</Button>
                    <Button onClick={saveConfiguration} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Template
                    </Button>
                </div>
            </div>

            <div className="flex gap-8 h-[calc(100vh-180px)]">
                {/* Left Sidebar - Controls */}
                <div className="w-[350px] flex-shrink-0 flex flex-col gap-6 overflow-y-auto pr-2 pb-12">
                    
                    {/* Settings Panel */}
                    <div className="bg-muted/30 p-4 rounded-xl border border-border">
                        <h3 className="font-semibold mb-4">Paper Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Preset Sizes</Label>
                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    {PRESETS.map(p => (
                                        <Button 
                                            key={p.label} 
                                            variant={config.paper_size.width === p.width ? "default" : "outline"}
                                            size="sm"
                                            className="text-xs"
                                            onClick={() => setConfig(prev => ({ ...prev, paper_size: { ...prev.paper_size, width: p.width, height: p.height } }))}
                                        >
                                            {p.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Width</Label>
                                    <Input value={config.paper_size.width} onChange={e => setConfig(p => ({...p, paper_size: {...p.paper_size, width: e.target.value}}))} />
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Height</Label>
                                    <Input value={config.paper_size.height} onChange={e => setConfig(p => ({...p, paper_size: {...p.paper_size, height: e.target.value}}))} />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground mb-2 block">Margins (px)</Label>
                                <div className="grid grid-cols-4 gap-2">
                                    <div><Input type="number" value={config.margins.top} onChange={e => setConfig(p => ({...p, margins: {...p.margins, top: parseInt(e.target.value)||0}}))} title="Top" /></div>
                                    <div><Input type="number" value={config.margins.right} onChange={e => setConfig(p => ({...p, margins: {...p.margins, right: parseInt(e.target.value)||0}}))} title="Right" /></div>
                                    <div><Input type="number" value={config.margins.bottom} onChange={e => setConfig(p => ({...p, margins: {...p.margins, bottom: parseInt(e.target.value)||0}}))} title="Bottom" /></div>
                                    <div><Input type="number" value={config.margins.left} onChange={e => setConfig(p => ({...p, margins: {...p.margins, left: parseInt(e.target.value)||0}}))} title="Left" /></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Drag and drop list */}
                    <div>
                        <h3 className="font-semibold mb-4">Elements</h3>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={config.elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
                                {config.elements.map(item => (
                                    <SortableElement key={item.id} item={item} onToggle={toggleElement} />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                {/* Right Canvas - Live Preview */}
                <div className="flex-1 bg-gray-100 rounded-xl border border-gray-200 overflow-y-auto p-8 flex justify-center items-start">
                    <PrintRenderer configuration={config} order={MOCK_ORDER} mode="preview" />
                </div>
            </div>
            
            {/* Print Styles for testing right on the page */}
            <style jsx global>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-document, .print-document * { visibility: visible; }
                    .print-document {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        margin: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                    }
                    @page { margin: 0; }
                }
            `}</style>
        </div>
    );
}
