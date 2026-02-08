import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, CalculationBreakdown, ConfigOptions, LedLayoutResult } from '../types';

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

    // --- PAGE 1: KÖŞEBENT KATMANI (Frame) ---
    doc.setFontSize(16);
    doc.text("KÖŞEBENT KATMANI", margin, margin + 5);

    // Draw Frame (Black Stroke)
    doc.setLineWidth(1.5);
    doc.setDrawColor(0, 0, 0); // Black
    doc.rect(drawX, drawY, drawW, drawH);

    // Dimensions Text
    doc.setFontSize(12);
    doc.setTextColor(0, 100, 255); // Blue text
    // Top dimension
    doc.text(`${widthCm} cm`, drawingCenterX, drawY - 5, { align: 'center' });
    // Left dimension
    doc.text(`${heightCm} cm`, drawX - 5, drawingCenterY, { align: 'right', angle: 90 });

    drawFooter(1);

    // --- PAGE 2: ZEMİN KATMANI (Backing) ---
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("ZEMİN KATMANI", margin, margin + 5);

    // Draw Filled Gray Rect
    doc.setFillColor(153, 153, 153); // #999999
    doc.rect(drawX, drawY, drawW, drawH, 'F');

    // Blue Dimensions again for clarity? Or top label
    doc.setTextColor(0, 100, 255);
    doc.setFontSize(14);
    doc.text(`${widthCm} cm`, drawingCenterX, drawY - 5, { align: 'center' });

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

    drawFooter(2);

    // --- PAGE 3: BASKI KATMANI (Print) ---
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("BASKI KATMANI", margin, margin + 5);

    // Draw Filled Blue Rect
    doc.setFillColor(0, 174, 239); // #00AEEF
    doc.rect(drawX, drawY, drawW, drawH, 'F');

    doc.setTextColor(0, 100, 255);
    doc.setFontSize(14);
    doc.text(`${widthCm} cm`, drawingCenterX, drawY - 5, { align: 'center' });

    drawFooter(3);

    // --- PAGE 4: LED KATMANI (LEDs) ---
    doc.addPage();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("LED KATMANI", margin, margin + 5);

    // Draw Light Gray Background Frame
    doc.setFillColor(240, 240, 240);
    doc.setDrawColor(200, 200, 200);
    doc.rect(drawX, drawY, drawW, drawH, 'FD');

    // LED Lines logic
    if (selectedLayout) {
        const { direction, stripCount } = selectedLayout;

        // Safe margin from edge (5cm typically requested, scaled)
        const edgeMargin = 5 * scale;

        doc.setDrawColor(255, 0, 0); // Red
        doc.setLineWidth(1.5);

        if (direction === 'Vertical') {
            // Strips are Vertical lines. Spacing is Horizontal.
            const usableWidth = drawW - (2 * edgeMargin);
            const spacing = stripCount > 1 ? usableWidth / (stripCount - 1) : 0;
            const spacingCm = stripCount > 1 ? (widthCm - 10) / (stripCount - 1) : 0;

            // Draw Lines
            for (let i = 0; i < stripCount; i++) {
                const x = drawX + edgeMargin + (i * spacing);
                doc.setDrawColor(255, 0, 0);
                doc.setLineWidth(1.5);
                doc.line(x, drawY + edgeMargin, x, drawY + drawH - edgeMargin);
            }

            // Draw Dimension Chain (Top)
            const dimY = drawY - 10;
            // Margin Left Dimension
            drawDimensionLine(drawX, dimY, drawX + edgeMargin, dimY, `5 cm`);

            // Interval Dimensions
            if (stripCount > 1) {
                for (let i = 0; i < stripCount - 1; i++) {
                    const x1 = drawX + edgeMargin + (i * spacing);
                    const x2 = drawX + edgeMargin + ((i + 1) * spacing);
                    drawDimensionLine(x1, dimY, x2, dimY, `${spacingCm.toFixed(1)} cm`);
                }
            }

            // Margin Right Dimension
            drawDimensionLine(drawX + drawW - edgeMargin, dimY, drawX + drawW, dimY, `5 cm`);

        } else {
            // Strips are Horizontal lines. Spacing is Vertical.
            const usableHeight = drawH - (2 * edgeMargin);
            const spacing = stripCount > 1 ? usableHeight / (stripCount - 1) : 0;
            const spacingCm = stripCount > 1 ? (heightCm - 10) / (stripCount - 1) : 0;

            // Draw Lines
            for (let i = 0; i < stripCount; i++) {
                const y = drawY + edgeMargin + (i * spacing);
                doc.setDrawColor(255, 0, 0);
                doc.setLineWidth(1.5);
                doc.line(drawX + edgeMargin, y, drawX + drawW - edgeMargin, y);
            }

            // Draw Dimension Chain (Left side)
            const dimX = drawX - 10;
            // Margin Top Dimension
            drawDimensionLine(dimX, drawY, dimX, drawY + edgeMargin, `5 cm`);

            // Interval Dimensions
            if (stripCount > 1) {
                for (let i = 0; i < stripCount - 1; i++) {
                    const y1 = drawY + edgeMargin + (i * spacing);
                    const y2 = drawY + edgeMargin + ((i + 1) * spacing);
                    // For vertical dim, text is rotated
                    drawDimensionLine(dimX, y1, dimX, y2, `${spacingCm.toFixed(1)} cm`);
                }
            }

            // Margin Bottom Dimension
            drawDimensionLine(dimX, drawY + drawH - edgeMargin, dimX, drawY + drawH, `5 cm`);
        }

        // Add "döşeme öncesi aradaki mesafe" note
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Roboto', 'normal');
        doc.text("döşeme öncesi aradaki mesafe", drawX + drawW + 2, drawingCenterY, { angle: 90 });
    }

    // Outer Dimensions (Blue)
    doc.setTextColor(0, 100, 255);
    doc.setFontSize(14);
    doc.text(`${widthCm} cm`, drawingCenterX, drawY - 15, { align: 'center' }); // Moved up slightly to avoid overlap with chain
    doc.text(`${heightCm} cm`, drawX - 18, drawingCenterY, { align: 'right', angle: 90 }); // Moved left

    drawFooter(4);

    // Save
    doc.save(`Siparis_${order.id}_Uretim.pdf`);
};
