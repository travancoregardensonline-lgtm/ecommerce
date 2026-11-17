import React from "react";

export interface PrintTemplateConfig {
    paper_size: { width: string; height: string; orientation?: "portrait" | "landscape" };
    margins: { top: number; right: number; bottom: number; left: number };
    elements: Array<{ id: string; type: string; enabled: boolean; settings?: any }>;
}

interface PrintRendererProps {
    configuration: PrintTemplateConfig;
    order: any;
    mode?: "preview" | "print"; // In preview mode we add borders to simulate the paper
}

export function PrintRenderer({ configuration, order, mode = "print" }: PrintRendererProps) {
    const { paper_size, margins, elements } = configuration;
    
    // Map order fields
    const orderNumber = order?.order_number ?? order?.id?.substring(0, 8).toUpperCase();
    const items = order?.order_items ?? [];
    const subtotal = items.reduce((s: number, i: any) => s + (Number(i.price) * Number(i.quantity)), 0);

    const renderElement = (el: any) => {
        if (!el || !el.enabled) return null;

        switch (el.type) {
            case "store_info":
                return (
                    <div key={el.id} className="mb-4">
                        <h2 className="text-lg font-bold">Travancore Gardens</h2>
                        <div className="text-sm">Kerala, India</div>
                    </div>
                );
            case "doc_title":
                return (
                    <div key={el.id} className="mb-4 text-right">
                        <h1 className="text-2xl font-normal uppercase tracking-wide m-0">Packing Slip</h1>
                        <div className="font-semibold mt-1">Order #{orderNumber}</div>
                        <div className="text-sm text-gray-600 mt-1">
                            {order?.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : ""}
                        </div>
                    </div>
                );
            case "shipping_address":
                return (
                    <div key={el.id} className="mb-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Ship To</div>
                        <div><strong>{order?.addresses?.full_name ?? order?.profiles?.name ?? "Customer"}</strong></div>
                        <div>{order?.addresses?.address_line1 ?? ""}</div>
                        {order?.addresses?.address_line2 && <div>{order.addresses.address_line2}</div>}
                        <div>{order?.addresses?.city ?? ""} {order?.addresses?.state ?? ""} {order?.addresses?.pincode ?? ""}</div>
                        <div>{order?.addresses?.phone ?? order?.profiles?.phone ?? ""}</div>
                    </div>
                );
            case "billing_address":
                return (
                    <div key={el.id} className="mb-4">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">Bill To</div>
                        <div><strong>{order?.profiles?.name ?? order?.addresses?.full_name ?? "Customer"}</strong></div>
                        <div>{order?.profiles?.email ?? ""}</div>
                        <div>{order?.profiles?.phone ?? order?.addresses?.phone ?? ""}</div>
                    </div>
                );
            case "product_table":
                return (
                    <table key={el.id} className="w-full text-left border-collapse mt-4">
                        <thead>
                            <tr>
                                <th className="border-y border-black py-2 text-xs uppercase tracking-wider font-semibold">Item</th>
                                <th className="border-y border-black py-2 text-xs uppercase tracking-wider font-semibold text-right w-24">Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-3 border-b border-gray-200">
                                        <div className="font-semibold">{item.products?.name ?? "Product"}</div>
                                        {item.products?.sku && <div className="text-xs text-gray-500 mt-1">SKU: {item.products.sku}</div>}
                                    </td>
                                    <td className="py-3 border-b border-gray-200 text-right font-semibold text-sm">
                                        {item.quantity}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case "product_table_with_price":
                return (
                    <table key={el.id} className="w-full text-left border-collapse mt-4">
                        <thead>
                            <tr>
                                <th className="border-y border-black py-2 text-xs uppercase tracking-wider font-semibold">Item</th>
                                <th className="border-y border-black py-2 text-xs uppercase tracking-wider font-semibold text-right w-24">Price</th>
                                <th className="border-y border-black py-2 text-xs uppercase tracking-wider font-semibold text-right w-16">Qty</th>
                                <th className="border-y border-black py-2 text-xs uppercase tracking-wider font-semibold text-right w-24">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-3 border-b border-gray-200">
                                        <div className="font-semibold">{item.products?.name ?? "Product"}</div>
                                        {item.products?.sku && <div className="text-xs text-gray-500 mt-1">SKU: {item.products.sku}</div>}
                                    </td>
                                    <td className="py-3 border-b border-gray-200 text-right">₹{Number(item.price).toLocaleString("en-IN")}</td>
                                    <td className="py-3 border-b border-gray-200 text-right font-semibold">{item.quantity}</td>
                                    <td className="py-3 border-b border-gray-200 text-right">₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case "totals":
                return (
                    <div key={el.id} className="flex justify-end mt-6">
                        <div className="w-64">
                            <div className="flex justify-between py-2 border-t border-black font-semibold text-base">
                                <span>Total</span>
                                <span>₹{Number(order.total_amount ?? subtotal).toLocaleString("en-IN")}</span>
                            </div>
                        </div>
                    </div>
                );
            case "customer_notes":
                return order?.notes ? (
                    <div key={el.id} className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Customer Notes</div>
                        <div className="text-sm italic">{order.notes}</div>
                    </div>
                ) : null;
            case "barcode":
                // For a real app, generate a barcode SVG/Img here.
                return (
                    <div key={el.id} className="mt-8 text-center flex flex-col items-center">
                        <div className="h-12 w-48 bg-black stripe-pattern" style={{ backgroundImage: "repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 8px, transparent 8px, transparent 10px)" }}></div>
                        <div className="text-xs tracking-[0.3em] mt-2">{orderNumber}</div>
                    </div>
                );
            default:
                return null;
        }
    };

    // Group header elements together if they are enabled (Store Info & Doc Title)
    const storeInfo = elements.find(e => e.type === "store_info");
    const docTitle = elements.find(e => e.type === "doc_title");
    
    const shippingAddress = elements.find(e => e.type === "shipping_address");
    const billingAddress = elements.find(e => e.type === "billing_address");

    const headerContent = (storeInfo?.enabled || docTitle?.enabled) ? (
        <div className="flex justify-between items-start mb-8">
            <div className="w-1/2">{renderElement(storeInfo)}</div>
            <div className="w-1/2 flex justify-end">{renderElement(docTitle)}</div>
        </div>
    ) : null;

    const addressContent = (shippingAddress?.enabled || billingAddress?.enabled) ? (
        <div className="flex justify-between items-start mb-8 gap-8">
            <div className="w-1/2">{renderElement(shippingAddress)}</div>
            <div className="w-1/2">{renderElement(billingAddress)}</div>
        </div>
    ) : null;

    return (
        <div 
            className={`print-document ${mode === "preview" ? "shadow-xl border border-gray-200 overflow-hidden" : ""}`}
            style={{ 
                width: paper_size.width, 
                minHeight: paper_size.height, 
                backgroundColor: "white",
                color: "black",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontSize: "13px",
                lineHeight: "1.5",
                margin: mode === "preview" ? "0 auto" : "0",
                boxSizing: "border-box",
                paddingTop: `${margins.top}px`,
                paddingRight: `${margins.right}px`,
                paddingBottom: `${margins.bottom}px`,
                paddingLeft: `${margins.left}px`,
            }}
        >
            {headerContent}
            {addressContent}
            {elements.map(el => {
                if (["store_info", "doc_title", "shipping_address", "billing_address"].includes(el.type)) return null;
                return renderElement(el);
            })}
        </div>
    );
}
