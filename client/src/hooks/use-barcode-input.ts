import { useRef, useCallback } from 'react';

interface UseBarcodeInputOptions {
  onScan?: (value: string) => void;
  scanTimeout?: number;
}

export function useBarcodeInput(options: UseBarcodeInputOptions = {}) {
  const { onScan, scanTimeout = 100 } = options;
  const scanBuffer = useRef<string>('');
  const scanTimer = useRef<NodeJS.Timeout | null>(null);
  const lastKeyTime = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isScanningRef = useRef(false);

  const normalizeGermanChars = (text: string): string => {
    const charMap: Record<string, string> = {
      'ß': '-',
      'ü': '[',
      'ö': ';',
      'ä': "'",
      'Ü': '{',
      'Ö': ':',
      'Ä': '"',
    };
    
    return text.split('').map(char => charMap[char] || char).join('');
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = Date.now();
    const timeDiff = now - lastKeyTime.current;
    
    if (timeDiff < scanTimeout && timeDiff > 0) {
      if (!isScanningRef.current) {
        isScanningRef.current = true;
        scanBuffer.current = '';
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    }
    
    lastKeyTime.current = now;
    
    if (scanTimer.current) {
      clearTimeout(scanTimer.current);
    }
    
    scanTimer.current = setTimeout(() => {
      if (isScanningRef.current && scanBuffer.current) {
        const normalizedValue = normalizeGermanChars(scanBuffer.current);
        if (onScan) {
          onScan(normalizedValue);
        }
        if (inputRef.current) {
          inputRef.current.value = normalizedValue;
          const event = new Event('input', { bubbles: true });
          inputRef.current.dispatchEvent(event);
        }
      }
      isScanningRef.current = false;
      scanBuffer.current = '';
    }, scanTimeout);
  }, [onScan, scanTimeout]);

  const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value;
    
    if (isScanningRef.current) {
      scanBuffer.current = value;
    }
  }, []);

  return {
    inputRef,
    handleKeyDown,
    handleInput,
  };
}
