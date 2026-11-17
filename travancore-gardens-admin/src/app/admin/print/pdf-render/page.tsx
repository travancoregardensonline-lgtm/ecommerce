"use client";

import { useSearchParams } from "next/navigation";
import { useAdminOrders, usePrintTemplates } from "@/hooks/useSupabase";
import { PrintRenderer } from "@/components/print/PrintRenderer";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function PdfRenderContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const ordersParam = searchParams.get("orders");
    const templateId = searchParams.get("templateId");
    const templateType = searchParams.get("type") || "packing_slip";

    const orderIds = ordersParam ? ordersParam.split(",") : (orderId ? [orderId] : []);

    const { data: { orders = [] } = {}, isLoading: loadingOrders } = useAdminOrders(1, 10000);
    const { data: templates, isLoading: loadingTemplates } = usePrintTemplates();

    if (orderIds.length === 0) return <div>Missing order ID</div>;
    if (loadingOrders || loadingTemplates) return <Loader2 className="animate-spin" />;

    const targetOrders = orders.filter((o: any) => orderIds.includes(o.id));

    // Select the requested template, or fallback to the first packing slip default
    let template = templates?.find((t: any) => t.id === templateId);
    if (!template && templates && templates.length > 0) {
        template = templates.find((t: any) => t.is_default && t.type === templateType) || 
                   templates.find((t: any) => t.type === templateType) || 
                   templates[0];
    }

    if (!template || targetOrders.length === 0) return <div>Data not found</div>;

    const config = {
        paper_size: template.configuration?.paper_size || template.paper_size,
        margins: template.configuration?.margins || template.margins,
        elements: template.configuration?.elements || template.elements || []
    };

    if (typeof config.elements === 'string') config.elements = JSON.parse(config.elements);
    if (typeof config.paper_size === 'string') config.paper_size = JSON.parse(config.paper_size);
    if (typeof config.margins === 'string') config.margins = JSON.parse(config.margins);

    return (
        <div style={{ backgroundColor: "white" }}>
            {/* Inject config as meta for Puppeteer to read */}
            <div id="print-config-meta" data-config={JSON.stringify(config)} style={{ display: "none" }}></div>
            
            <style jsx global>{`
                @media print {
                    .page-break { display: block; break-after: page; page-break-after: always; }
                    .page-divider { display: none; }
                }
                @media screen {
                    .page-divider { 
                        display: block;
                        height: 4px; 
                        background: #cbd5e1; 
                        margin: 40px auto; 
                        max-width: 800px;
                        border: none;
                        border-radius: 2px;
                    }
                }
            `}</style>
            
            {targetOrders.map((order: any, index: number) => (
                <div key={order.id} className={index < targetOrders.length - 1 ? "page-break" : ""}>
                    <PrintRenderer configuration={config} order={order} mode="print" />
                    {index < targetOrders.length - 1 && <hr className="page-divider" />}
                </div>
            ))}
            
            <script dangerouslySetInnerHTML={{ __html: 'if(window.location.search.includes("autoPrint=true")) { setTimeout(()=>window.print(), 500); }' }}></script>
        </div>
    );
}

export default function PdfRenderPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PdfRenderContent />
        </Suspense>
    );
}
