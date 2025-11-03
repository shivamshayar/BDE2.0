import bwipjs from 'bwip-js';
import { jsPDF } from 'jspdf';

export interface BarcodeItem {
  id: string;
  value: string;
  description?: string;
}

export async function generateBarcodeDataURL(text: string): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    bwipjs.toCanvas(canvas, {
      bcid: 'code128',
      text: text,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center',
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Barcode generation error:', error);
    throw error;
  }
}

export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    bwipjs.toCanvas(canvas, {
      bcid: 'qrcode',
      text: text,
      scale: 3,
      width: 30,
      height: 30,
      includetext: false,
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('QR code generation error:', error);
    throw error;
  }
}

export async function downloadBarcodesAsPDF(
  items: BarcodeItem[],
  title: string
) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const margin = 10;
  const itemsPerRow = 3;
  const itemsPerPage = 9;
  const cardWidth = (pageWidth - (margin * 4)) / itemsPerRow;
  const cardHeight = 85;
  const spacing = 5;
  
  let currentPage = 0;
  
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(21, 128, 61);
  pdf.text(title, pageWidth / 2, 15, { align: 'center' });
  
  pdf.setLineWidth(0.5);
  pdf.setDrawColor(21, 128, 61);
  pdf.line(margin, 20, pageWidth - margin, 20);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const pageIndex = Math.floor(i / itemsPerPage);
    const indexInPage = i % itemsPerPage;
    
    if (pageIndex > currentPage) {
      pdf.addPage();
      currentPage = pageIndex;
      
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(21, 128, 61);
      pdf.text(title, pageWidth / 2, 15, { align: 'center' });
      
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(21, 128, 61);
      pdf.line(margin, 20, pageWidth - margin, 20);
    }
    
    const row = Math.floor(indexInPage / itemsPerRow);
    const col = indexInPage % itemsPerRow;
    
    const x = margin + (col * (cardWidth + spacing));
    const y = 28 + (row * (cardHeight + spacing));
    
    try {
      const barcodeDataURL = await generateBarcodeDataURL(item.value);
      const qrCodeDataURL = await generateQRCodeDataURL(item.value);
      
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(x, y, cardWidth, cardHeight, 2, 2);
      
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(x, y, cardWidth, 8, 2, 2, 'F');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      const textWidth = pdf.getTextWidth(item.value);
      const textX = x + (cardWidth / 2) - (textWidth / 2);
      pdf.text(item.value, textX, y + 5.5);
      
      if (item.description) {
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 116, 139);
        const descWidth = pdf.getTextWidth(item.description);
        const descX = x + (cardWidth / 2) - (descWidth / 2);
        pdf.text(item.description, descX, y + 14);
      }
      
      const contentY = item.description ? y + 18 : y + 12;
      const barcodeWidth = cardWidth - 8;
      const barcodeHeight = 30;
      const barcodeX = x + 4;
      
      pdf.addImage(barcodeDataURL, 'PNG', barcodeX, contentY, barcodeWidth, barcodeHeight);
      
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 116, 139);
      const barcodeLabel = 'Barcode';
      const barcodeLabelWidth = pdf.getTextWidth(barcodeLabel);
      pdf.text(barcodeLabel, x + (cardWidth / 2) - (barcodeLabelWidth / 2), contentY + barcodeHeight + 3);
      
      const qrY = contentY + barcodeHeight + 7;
      const qrSize = 20;
      const qrX = x + (cardWidth / 2) - (qrSize / 2);
      
      pdf.addImage(qrCodeDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
      
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 116, 139);
      const qrLabel = 'QR Code';
      const qrLabelWidth = pdf.getTextWidth(qrLabel);
      pdf.text(qrLabel, x + (cardWidth / 2) - (qrLabelWidth / 2), qrY + qrSize + 3);
      
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(148, 163, 184);
      const dateText = new Date().toLocaleDateString();
      const dateWidth = pdf.getTextWidth(dateText);
      const dateX = x + (cardWidth / 2) - (dateWidth / 2);
      pdf.text(dateText, dateX, y + cardHeight - 3);
      
    } catch (error) {
      console.error(`Error generating codes for ${item.value}:`, error);
    }
  }
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  for (let i = 0; i < totalPages; i++) {
    pdf.setPage(i + 1);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text(
      `Page ${i + 1} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' }
    );
  }

  const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}-barcodes.pdf`;
  pdf.save(fileName);
}
