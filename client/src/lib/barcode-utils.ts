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

export async function downloadBarcodesAsPDF(
  items: BarcodeItem[],
  title: string
) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  let yPosition = 20;
  const itemsPerPage = 4;
  let itemCount = 0;

  pdf.setFontSize(16);
  pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  for (const item of items) {
    if (itemCount > 0 && itemCount % itemsPerPage === 0) {
      pdf.addPage();
      yPosition = 20;
    }

    try {
      const barcodeDataURL = await generateBarcodeDataURL(item.value);
      
      // Add item value
      pdf.setFontSize(12);
      pdf.text(item.value, 20, yPosition);
      yPosition += 5;
      
      // Add description if available
      if (item.description) {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(item.description, 20, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 5;
      }
      
      // Add barcode image
      const imgWidth = pageWidth - 40;
      const imgHeight = 30;
      pdf.addImage(barcodeDataURL, 'PNG', 20, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 15;
      
      itemCount++;
    } catch (error) {
      console.error(`Error generating barcode for ${item.value}:`, error);
    }
  }

  const fileName = `${title.toLowerCase().replace(/\s+/g, '-')}-barcodes.pdf`;
  pdf.save(fileName);
}
