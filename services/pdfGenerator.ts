import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, CalculationBreakdown, ConfigOptions, LedLayoutResult, ProfileType } from '../types';

export const generateReceiptPdf = (params: {
    customerName: string;
    customerPhone: string;
    items: { title: string; price: number; note?: string }[];
    orderIds: number[];
    subtotal: number;
    discountPercentage?: number | null;
    total: number;
}) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const margin = 14;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.text('SİPARİŞ FİŞİ', pageWidth / 2, margin, { align: 'center' });

    doc.setFontSize(10);
    const y0 = margin + 8;
    doc.text(`Tarih: ${new Date().toLocaleString('tr-TR')}`, margin, y0);
    doc.text(`Müşteri: ${params.customerName || '-'}`, margin, y0 + 6);
    doc.text(`Telefon: ${params.customerPhone || '-'}`, margin, y0 + 12);

    const orderLine = params.orderIds?.length
        ? `Sipariş No: ${params.orderIds.map(id => `#${id}`).join(', ')}` 
        : 'Sipariş No: -';
    doc.text(orderLine, margin, y0 + 18);

    const tableStartY = y0 + 26;

    autoTable(doc, {
        startY: tableStartY,
        head: [['#', 'Ürün', 'Tutar']],
        body: params.items.map((it, idx) => [
            String(idx + 1),
            it.note ? `${it.title}\nNot: ${it.note}` : it.title,
            `$${(it.price || 0).toFixed(2)}`
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [79, 70, 229] }
    });

    const afterTableY = (doc as any).lastAutoTable?.finalY ?? tableStartY + 10;
    const summaryY = afterTableY + 10;

    doc.setFontSize(11);
    doc.text(`Ara Toplam: $${params.subtotal.toFixed(2)}`, margin, summaryY);

    if (params.discountPercentage != null && params.discountPercentage > 0) {
        const discountAmount = params.subtotal - params.total;
        doc.text(`İndirim: %${params.discountPercentage} (-$${discountAmount.toFixed(2)})`, margin, summaryY + 6);
        doc.setFontSize(13);
        doc.text(`TOPLAM: $${params.total.toFixed(2)}`, margin, summaryY + 14);
    } else {
        doc.setFontSize(13);
        doc.text(`TOPLAM: $${params.total.toFixed(2)}`, margin, summaryY + 8);
    }

    doc.save(`Siparis_Fisi_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const generateProductionPdf = async (
    order: Order,
    breakdown: CalculationBreakdown,
    config: ConfigOptions,
    options?: {
        layoutOverride?: LedLayoutResult | null;
        adapterNameOverride?: string | null;
        requiredAmperesOverride?: number | null;
        selectedAmperesOverride?: number | null;
    }
) => {
    // 1. Setup Document (A4 Landscape: 297mm x 210mm)
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    // --- Font Loading for Turkish Support ---
    try {
        const fontUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
        const response = await fetch(fontUrl);
        const blob = await response.blob();
        const reader = new FileReader();

        // Convert blob to base64
        await new Promise((resolve) => {
            reader.onloadend = resolve;
            reader.readAsDataURL(blob);
        });

        const base64data = (reader.result as string).split(',')[1];

        doc.addFileToVFS('Roboto-Regular.ttf', base64data);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'bold');
        doc.setFont('Roboto');
    } catch (e) {
        console.warn("Could not load custom font, falling back to default. Turkish characters may be broken.", e);
    }
    // ----------------------------------------

    const pageWidth = doc.internal.pageSize.getWidth(); // 297
    const pageHeight = doc.internal.pageSize.getHeight(); // 210

    // Draw area definitions
    const margin = 10;
    const footerHeight = 50; // Space for the table
    const drawingAreaHeight = pageHeight - footerHeight - (margin * 2);
    const drawingCenterY = margin + (drawingAreaHeight / 2);
    const drawingCenterX = pageWidth / 2;

    const selectedLayout = options?.layoutOverride ?? breakdown.selectedLayout;
    const adapterName = options?.adapterNameOverride ?? breakdown.adapterName;
    const requiredAmperes = options?.requiredAmperesOverride ?? breakdown.requiredAmperes;
    const selectedAmperes = options?.selectedAmperesOverride ?? breakdown.selectedAmperes;

    // Helper: Draw standardized footer table manually
    const drawFooter = (pageNum: number) => {
        const tableData = [
            ['KULLANILACAK LED METRESİ', `: ${selectedLayout?.totalLedMeters?.toFixed(2) || '0'} METRE ENDİREK LED`, 'FİRMA:', `: ${order.customerName || ''}`],
            ['KULLANILACAK ADAPTÖR AMPER GÜCÜ', `: ${adapterName || '-'} (${(requiredAmperes || 0).toFixed(1)}A)`, 'TEL:', `: ${order.customerPhone || ''}`],
            ['KÖŞEBENT ADEDİ', `: ${breakdown.perimeter ? '4' : '4'}`, 'İLGİLİ PERSONEL:', ': -'],
            ['ZEMİN MALZEMESİ', `: ${config.backplate || '-'}`, 'SİPARİŞ TARİHİ', `: ${new Date(order.createdAt).toLocaleDateString()}`],
            ['KASA ŞEKLİ', `: ${config.profile || '-'}`, 'TESLİM TARİHİ', `: -`],
            ['PROFİL RENGİ', `: ${config.frameColor || '-'}`, '', ''],
            ['KABLO', `: 2 METRE`, 'NOT:', `: ${(order as any).note || ''}`],
            ['BASKI', `: VAR`, '', ''],
            ['AYAK', `: YOK`, '', '']
        ];

        const startY = pageHeight - footerHeight + 5; // Add a bit of padding from the drawing area
        const rowHeight = 5;
        const colWidths = [60, 85, 40, 92]; // Total 277 (297 - 20 margin)

        doc.setFontSize(7);
        doc.setLineWidth(0.1);
        doc.setDrawColor(200, 200, 200); // Light gray grid lines

        let currentY = startY;

        tableData.forEach((row) => {
            let currentX = margin;

            // Draw cells
            row.forEach((cellText, index) => {
                const width = colWidths[index];

                // Draw Grid Rect
                doc.setDrawColor(200, 200, 200);
                doc.rect(currentX, currentY, width, rowHeight);

                // Text Styling
                if (index === 0 || index === 2) {
                    doc.setFont('Roboto', 'bold');
                } else {
                    doc.setFont('Roboto', 'normal');
                }

                // Draw Text (Vertically centered)
                // Add padding: x + 1, y + 3.5 (approx for 7pt font)
                doc.setTextColor(0, 0, 0);
                // Handle text truncation or let it overflow? 
                // Basic render
                doc.text(String(cellText), currentX + 1, currentY + 3.5);

                currentX += width;
            });

            currentY += rowHeight;
        });
    };

    // Parse dimensions
    const widthCm = config.width;
    const heightCm = config.height;

    // Calculate aspect ratio for drawing
    // We want to fit the rect within [pageWidth - 40, drawingAreaHeight - 20]
    const maxDrawWidth = pageWidth - 60;
    const maxDrawHeight = drawingAreaHeight - 20;

    const scaleX = maxDrawWidth / widthCm;
    const scaleY = maxDrawHeight / heightCm;
    const scale = Math.min(scaleX, scaleY);

    const drawW = widthCm * scale;
    const drawH = heightCm * scale;
    const drawX = drawingCenterX - (drawW / 2);
    const drawY = drawingCenterY - (drawH / 2);

    const addDesignImage = async (dataUrl: string | null | undefined) => {
        if (!dataUrl) return false;
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Image load failed'));
                img.src = dataUrl;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return false;
            ctx.drawImage(img, 0, 0);
            const jpeg = canvas.toDataURL('image/jpeg', 0.92);

            doc.addImage(jpeg, 'JPEG', drawX, drawY, drawW, drawH);
            return true;
        } catch {
            return false;
        }
    };

    // Helper: Draw Dimension Line
    const drawDimensionLine = (x1: number, y1: number, x2: number, y2: number, text: string, offset: number = 0) => {
        const tickSize = 1;
        doc.setDrawColor(0, 100, 255); // Blue
        doc.setTextColor(0, 100, 255);
        doc.setFontSize(7);
        doc.setLineWidth(0.2);

        // Main line
        doc.line(x1, y1, x2, y2);

        if (Math.abs(x1 - x2) > Math.abs(y1 - y2)) {
            // Horizontal line, vertical ticks
            doc.line(x1, y1 - tickSize, x1, y1 + tickSize);
            doc.line(x2, y2 - tickSize, x2, y2 + tickSize);
            doc.text(text, x1 + (x2 - x1) / 2, y1 - 1, { align: 'center' });
        } else {
            // Vertical line, horizontal ticks
            doc.line(x1 - tickSize, y1, x1 + tickSize, y1);
            doc.line(x2 - tickSize, y2, x2 + tickSize, y2);
            doc.text(text, x1 - 2, y1 + (y2 - y1) / 2, { align: 'right', angle: 90 });
        }
    };

    // --- PAGE 1: LED DİZİM MESAFESİ ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("LED DİZİM MESAFESİ", margin, margin + 5);

    // Draw Light Gray Background Frame
    doc.setFillColor(240, 240, 240);
    doc.setDrawColor(200, 200, 200);
    doc.rect(drawX, drawY, drawW, drawH, 'FD');

    if (selectedLayout) {
        const { direction, stripCount } = selectedLayout;

        const edgeMargin = 5 * scale;

        doc.setDrawColor(255, 0, 0); // Red
        doc.setLineWidth(1.5);

        if (direction === 'Vertical') {
            const usableWidth = drawW - (2 * edgeMargin);
            const spacing = stripCount > 1 ? usableWidth / (stripCount - 1) : 0;
            const spacingCm = stripCount > 1 ? (widthCm - 10) / (stripCount - 1) : 0;

            for (let i = 0; i < stripCount; i++) {
                const x = drawX + edgeMargin + (i * spacing);
                doc.line(x, drawY + edgeMargin, x, drawY + drawH - edgeMargin);
            }

            const dimY = drawY - 10;
            drawDimensionLine(drawX, dimY, drawX + edgeMargin, dimY, `5 cm`);
            if (stripCount > 1) {
                for (let i = 0; i < stripCount - 1; i++) {
                    const x1 = drawX + edgeMargin + (i * spacing);
                    const x2 = drawX + edgeMargin + ((i + 1) * spacing);
                    drawDimensionLine(x1, dimY, x2, dimY, `${spacingCm.toFixed(1)} cm`);
                }
            }
            drawDimensionLine(drawX + drawW - edgeMargin, dimY, drawX + drawW, dimY, `5 cm`);
        } else {
            const usableHeight = drawH - (2 * edgeMargin);
            const spacing = stripCount > 1 ? usableHeight / (stripCount - 1) : 0;
            const spacingCm = stripCount > 1 ? (heightCm - 10) / (stripCount - 1) : 0;

            for (let i = 0; i < stripCount; i++) {
                const y = drawY + edgeMargin + (i * spacing);
                doc.line(drawX + edgeMargin, y, drawX + drawW - edgeMargin, y);
            }

            const dimX = drawX - 10;
            drawDimensionLine(dimX, drawY, dimX, drawY + edgeMargin, `5 cm`);
            if (stripCount > 1) {
                for (let i = 0; i < stripCount - 1; i++) {
                    const y1 = drawY + edgeMargin + (i * spacing);
                    const y2 = drawY + edgeMargin + ((i + 1) * spacing);
                    drawDimensionLine(dimX, y1, dimX, y2, `${spacingCm.toFixed(1)} cm`);
                }
            }
            drawDimensionLine(dimX, drawY + drawH - edgeMargin, dimX, drawY + drawH, `5 cm`);
        }

        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Roboto', 'normal');
        doc.text("döşeme öncesi aradaki mesafe", drawX + drawW + 2, drawingCenterY, { angle: 90 });
    }

    doc.setTextColor(0, 100, 255);
    doc.setFontSize(14);
    doc.text(`${widthCm} cm`, drawingCenterX, drawY - 15, { align: 'center' });
    doc.text(`${heightCm} cm`, drawX - 18, drawingCenterY, { align: 'right', angle: 90 });

    drawFooter(1);

    // --- PAGE 2: ÖN YÜZ BASKI ---
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("ÖN YÜZ BASKI", margin, margin + 5);
    doc.setFillColor(0, 174, 239); // #00AEEF
    doc.rect(drawX, drawY, drawW, drawH, 'F');
    await addDesignImage(config.userImageUrl);
    doc.setTextColor(0, 100, 255);
    doc.setFontSize(14);
    doc.text(`${widthCm} cm`, drawingCenterX, drawY - 5, { align: 'center' });
    drawFooter(2);

    // --- PAGE 3: ARKA YÜZ BASKI (Çift Taraf) ---
    if (config.profile === ProfileType.DOUBLE) {
        doc.addPage();
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text("ARKA YÜZ BASKI", margin, margin + 5);
        doc.setFillColor(0, 174, 239);
        doc.rect(drawX, drawY, drawW, drawH, 'F');
        await addDesignImage(config.backImageUrl);
        doc.setTextColor(0, 100, 255);
        doc.setFontSize(14);
        doc.text(`${widthCm} cm`, drawingCenterX, drawY - 5, { align: 'center' });
        drawFooter(3);
    }

    // Save
    doc.save(`Siparis_${order.id}_Uretim.pdf`);
};
