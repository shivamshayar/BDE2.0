import { useEffect, useRef, useState } from "react";
import bwipjs from "bwip-js";
import { Card } from "@/components/ui/card";

interface BarcodeDisplayProps {
  text: string;
  className?: string;
}

export function BarcodeDisplay({ text, className = "" }: BarcodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !text) return;

    try {
      setError(null);
      bwipjs.toCanvas(canvasRef.current, {
        bcid: 'code128',
        text: text,
        scale: 2,
        height: 8,
        includetext: true,
        textxalign: 'center',
      });
    } catch (err) {
      console.error('Barcode generation error:', err);
      setError('Failed to generate barcode');
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
    <div className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
}
