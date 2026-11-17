import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const templateId = searchParams.get("templateId");

    if (!orderId) {
        return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    try {
        // Find the base URL of this deployment
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
        const renderUrl = `${baseUrl}/admin/print/pdf-render?orderId=${orderId}${templateId ? `&templateId=${templateId}` : ''}`;

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();
        await page.goto(renderUrl, { waitUntil: "networkidle0" });

        // Retrieve paper config injected in the DOM by the render route
        const configRaw = await page.evaluate(() => {
            const el = document.getElementById('print-config-meta');
            return el ? el.getAttribute('data-config') : null;
        });

        let format = "A4";
        let width, height;
        let margin = { top: '0', right: '0', bottom: '0', left: '0' };

        if (configRaw) {
            const config = JSON.parse(configRaw);
            width = config.paper_size.width;
            height = config.paper_size.height;
            margin = {
                top: `${config.margins.top}px`,
                right: `${config.margins.right}px`,
                bottom: `${config.margins.bottom}px`,
                left: `${config.margins.left}px`,
            };
        }

        const pdfOptions: any = {
            printBackground: true,
            margin: margin,
        };

        if (width && height && !['A4', 'letter', 'legal'].includes(width)) {
            pdfOptions.width = width;
            pdfOptions.height = height;
        } else {
            pdfOptions.format = format;
        }

        const pdfBuffer = await page.pdf(pdfOptions);
        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Order-${orderId}.pdf"`
            }
        });
    } catch (error) {
        console.error("PDF Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }
}
