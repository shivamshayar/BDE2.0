import { useEffect, useRef, useState } from "react";
import bwipjs from "bwip-js";
import { Card } from "@/components/ui/card";

interface BarcodeDisplayProps {
  text: string;
  className?: string;
}

export function BarcodeDisplay({ text, className = "" }: BarcodeDisplayProps) {
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!text) return;

    try {
      setError(null);
      
      if (barcodeCanvasRef.current) {
        bwipjs.toCanvas(barcodeCanvasRef.current, {
          bcid: 'code128',
          text: text,
          scale: 2,
          height: 8,
          includetext: true,
          textxalign: 'center',
        });
      }

      if (qrCanvasRef.current) {
        bwipjs.toCanvas(qrCanvasRef.current, {
          bcid: 'qrcode',
          text: text,
          scale: 2,
          width: 20,
          height: 20,
          includetext: false,
        });
      }
    } catch (err) {
      console.error('Code generation error:', err);
      setError('Failed to generate codes');
    }
  }, [text]);

  if (error) {
    return (
      <Card className={`p-2 bg-destructive/10 text-destructive text-xs ${className}`}>
        {error}
      </Card>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex flex-col items-center gap-1">
        <canvas ref={barcodeCanvasRef} />
        <span className="text-xs text-muted-foreground">Barcode</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <canvas ref={qrCanvasRef} />
        <span className="text-xs text-muted-foreground">QR Code</span>
      </div>
    </div>
  );
}
