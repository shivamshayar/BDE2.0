import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, Square, History, ChevronDown } from "lucide-react";
import BottomDrawer from "./BottomDrawer";
import WorkHistoryDialog from "./WorkHistoryDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from '@/contexts/LanguageContext';
import { parseCombinedQRCode, validateParsedResult } from '@/lib/qr-code-parser';

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  isRunning: boolean;
  duration: number;
  partNumber: string;
  orderNumber: string;
  performanceId: string;
}

interface PerformanceIdItem {
  performanceId: string;
  performanceName: string;
}

interface CompactWorkTrackerProps {
  session: UserSession;
  department?: string;
  machineId?: string;
  partNumbers: string[];
  orderNumbers: string[];
  performanceIds: PerformanceIdItem[];
  recentPartNumbers?: string[];
  recentOrderNumbers?: string[];
  recentPerformanceIds?: string[];
  onUpdateSession?: (sessionId: string, updates: Partial<UserSession>) => void;
  onStopSession?: (sessionId: string, data: {
    partNumber: string;
    orderNumber: string;
    performanceId: string;
    duration: number;
  }) => void;
}

export default function CompactWorkTracker({
  session,
  department = "Production",
  machineId = "BDE-1",
  partNumbers,
  orderNumbers,
  performanceIds,
  recentPartNumbers = [],
  recentOrderNumbers = [],
  recentPerformanceIds = [],
  onUpdateSession,
  onStopSession,
}: CompactWorkTrackerProps) {
  const { t } = useLanguage();
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [localDuration, setLocalDuration] = useState(session.duration);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<"part" | "order" | "performance">("part");
  const [showOvertimeNotification, setShowOvertimeNotification] = useState(false);
  const [overtimeAcknowledged, setOvertimeAcknowledged] = useState(false);
  
  const partLastKeyTimeRef = useRef<number>(0);
  const partIsScanningRef = useRef<boolean>(false);
  const partScanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const partInputRef = useRef<HTMLInputElement>(null);
  
  const orderLastKeyTimeRef = useRef<number>(0);
  const orderIsScanningRef = useRef<boolean>(false);
  const orderScanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const orderInputRef = useRef<HTMLInputElement>(null);
  
  const perfLastKeyTimeRef = useRef<number>(0);
  const perfIsScanningRef = useRef<boolean>(false);
  const perfScanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const perfInputRef = useRef<HTMLInputElement>(null);
  
  const startButtonRef = useRef<HTMLButtonElement>(null);
  
  // Flag to prevent onChange from firing after combined QR code parsing
  const combinedQRParsedRef = useRef<boolean>(false);
  
  // Debounce refs for combined QR code detection
  // We need to wait until the scanner is done typing before processing
  const orderCombinedQRDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const partCombinedQRDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingOrderValueRef = useRef<string>('');
  const pendingPartValueRef = useRef<string>('');

  useEffect(() => {
    setLocalDuration(session.duration);
  }, [session.duration]);

  // Auto-focus Order Number field when component mounts, timer stops, or user switches
  useEffect(() => {
    if (!session.isRunning && orderInputRef.current) {
      // Multiple attempts with increasing delays for Raspberry Pi compatibility
      const attemptFocus = (attempt: number = 0) => {
        if (attempt > 5) return; // Max 5 attempts
        
        const delay = 100 + (attempt * 100); // 100ms, 200ms, 300ms, etc.
        const timer = setTimeout(() => {
          if (orderInputRef.current && document.activeElement !== orderInputRef.current) {
            orderInputRef.current.focus();
            console.log(`[Auto-focus] Order Number field focused for user ${session.userName} (attempt ${attempt + 1})`);
            
            // Verify focus worked, retry if not
            setTimeout(() => {
              if (document.activeElement !== orderInputRef.current) {
                attemptFocus(attempt + 1);
              }
            }, 50);
          }
        }, delay);
        
        return timer;
      };
      
      const timer = attemptFocus(0);
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [session.isRunning, session.id]);

  const initials = session.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Helper to get performance name from ID
  const getPerformanceName = (performanceId: string): string => {
    const perfItem = performanceIds.find(p => p.performanceId === performanceId);
    return perfItem ? perfItem.performanceName : performanceId;
  };

  const handleStart = () => {
    if (session.partNumber && session.orderNumber && session.performanceId) {
      onUpdateSession?.(session.id, { isRunning: true });
    }
  };

  const handleStop = () => {
    // Auto-submit without confirmation
    onUpdateSession?.(session.id, { isRunning: false });
    if (onStopSession) {
      onStopSession(session.id, {
        partNumber: session.partNumber,
        orderNumber: session.orderNumber,
        performanceId: session.performanceId,
        duration: localDuration,
      });
    }
    // Only reset duration after stopping - keep part/order/performance for next recording
    onUpdateSession?.(session.id, {
      duration: 0,
    });
  };


  // Check for overtime (> 1 hour) and show notification
  useEffect(() => {
    const ONE_HOUR = 3600;
    if (session.isRunning && localDuration > ONE_HOUR && !overtimeAcknowledged && !showOvertimeNotification) {
      setShowOvertimeNotification(true);
    }
  }, [session.isRunning, localDuration, overtimeAcknowledged, showOvertimeNotification]);

  // Reset acknowledgment when timer stops
  useEffect(() => {
    if (!session.isRunning) {
      setOvertimeAcknowledged(false);
      setShowOvertimeNotification(false);
    }
  }, [session.isRunning]);

  const hours = Math.floor(localDuration / 3600);
  const minutes = Math.floor((localDuration % 3600) / 60);
  const secs = localDuration % 60;

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  const openDrawer = (type: "part" | "order" | "performance") => {
    if (!session.isRunning) {
      setDrawerType(type);
      setDrawerOpen(true);
    }
  };

  const handleSelectValue = (value: string) => {
    if (drawerType === "part") {
      onUpdateSession?.(session.id, { partNumber: value });
    } else if (drawerType === "order") {
      onUpdateSession?.(session.id, { orderNumber: value });
    } else {
      // For performance IDs, value is the performance name, need to find the ID
      const perfItem = performanceIds.find(p => p.performanceName === value);
      if (perfItem) {
        onUpdateSession?.(session.id, { performanceId: perfItem.performanceId });
      }
    }
    setDrawerOpen(false);
  };

  const canStart = !session.isRunning && session.partNumber && session.orderNumber && session.performanceId;

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

  // Production-level combined QR code parsing (using robust parser)

  const handlePartNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const normalized = normalizeGermanChars(newValue);
    
    // If we just processed a combined QR, ignore subsequent onChange events
    if (combinedQRParsedRef.current) {
      console.log('[Part Field] Ignoring onChange - combined QR lock active');
      return;
    }
    
    const now = Date.now();
    const timeDiff = now - partLastKeyTimeRef.current;
    partLastKeyTimeRef.current = now;
    
    if (partScanTimeoutRef.current) {
      clearTimeout(partScanTimeoutRef.current);
    }
    
    const wasScanning = partIsScanningRef.current;
    const isRapidTyping = timeDiff > 0 && timeDiff < 100;
    
    // Always update the part number field immediately (so user sees what's being typed)
    onUpdateSession?.(session.id, { partNumber: normalized });
    
    // Check if this COULD be a combined QR code - use debouncing to wait for full input
    if (normalized && isRapidTyping) {
      const combined = parseCombinedQRCode(normalized);
      if (combined && validateParsedResult(combined)) {
        // Store the pending value and start/restart debounce timer
        pendingPartValueRef.current = normalized;
        
        // Clear any existing debounce timer
        if (partCombinedQRDebounceRef.current) {
          clearTimeout(partCombinedQRDebounceRef.current);
        }
        
        // Wait 150ms after last keystroke before processing combined QR
        // This ensures we have the COMPLETE scanned value
        partCombinedQRDebounceRef.current = setTimeout(() => {
          const finalValue = pendingPartValueRef.current;
          const finalCombined = parseCombinedQRCode(finalValue);
          
          if (finalCombined && validateParsedResult(finalCombined)) {
            console.log('[Combined QR FINAL in Part Field]', { 
              scanned: finalValue, 
              format: finalCombined.format,
              confidence: finalCombined.confidence,
              orderNumber: finalCombined.orderNumber, 
              partNumber: finalCombined.partNumber
            });
            
            // LOCK: Prevent any more processing
            combinedQRParsedRef.current = true;
            
            // Update BOTH fields with the COMPLETE parsed values
            onUpdateSession?.(session.id, { 
              orderNumber: finalCombined.orderNumber, 
              partNumber: finalCombined.partNumber 
            });
            
            // Focus Performance ID after a short delay
            setTimeout(() => {
              combinedQRParsedRef.current = false;
              perfInputRef.current?.focus();
            }, 100);
          }
          
          pendingPartValueRef.current = '';
        }, 150);
        
        return; // Don't do normal field navigation while potentially scanning combined QR
      }
    }
    
    // Clear any pending combined QR detection if this doesn't look like a combined code
    if (partCombinedQRDebounceRef.current) {
      clearTimeout(partCombinedQRDebounceRef.current);
      partCombinedQRDebounceRef.current = null;
    }
    pendingPartValueRef.current = '';
    
    // Normal part number processing - handle scanning state
    if (isRapidTyping && !wasScanning) {
      partIsScanningRef.current = true;
    } else if (!isRapidTyping) {
      partIsScanningRef.current = false;
    }
    
    // After Part Number, move to Performance ID (Order → Part → Performance flow)
    partScanTimeoutRef.current = setTimeout(() => {
      partIsScanningRef.current = false;
      if (normalized && !session.isRunning) {
        perfInputRef.current?.focus();
      }
    }, 100);
  };

  const handleOrderNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const normalized = normalizeGermanChars(newValue);
    
    // If we just processed a combined QR, ignore subsequent onChange events
    if (combinedQRParsedRef.current) {
      console.log('[Order Field] Ignoring onChange - combined QR lock active');
      return;
    }
    
    const now = Date.now();
    const timeDiff = now - orderLastKeyTimeRef.current;
    orderLastKeyTimeRef.current = now;
    
    if (orderScanTimeoutRef.current) {
      clearTimeout(orderScanTimeoutRef.current);
    }
    
    const wasScanning = orderIsScanningRef.current;
    const isRapidTyping = timeDiff > 0 && timeDiff < 100;
    
    // Always update the order number field immediately (so user sees what's being typed)
    onUpdateSession?.(session.id, { orderNumber: normalized });
    
    // Check if this COULD be a combined QR code - use debouncing to wait for full input
    if (normalized && isRapidTyping) {
      const combined = parseCombinedQRCode(normalized);
      if (combined && validateParsedResult(combined)) {
        // Store the pending value and start/restart debounce timer
        pendingOrderValueRef.current = normalized;
        
        // Clear any existing debounce timer
        if (orderCombinedQRDebounceRef.current) {
          clearTimeout(orderCombinedQRDebounceRef.current);
        }
        
        // Wait 150ms after last keystroke before processing combined QR
        // This ensures we have the COMPLETE scanned value
        orderCombinedQRDebounceRef.current = setTimeout(() => {
          const finalValue = pendingOrderValueRef.current;
          const finalCombined = parseCombinedQRCode(finalValue);
          
          if (finalCombined && validateParsedResult(finalCombined)) {
            console.log('[Combined QR FINAL in Order Field]', { 
              scanned: finalValue, 
              format: finalCombined.format,
              confidence: finalCombined.confidence,
              orderNumber: finalCombined.orderNumber, 
              partNumber: finalCombined.partNumber
            });
            
            // LOCK: Prevent any more processing
            combinedQRParsedRef.current = true;
            
            // Update BOTH fields with the COMPLETE parsed values
            onUpdateSession?.(session.id, { 
              orderNumber: finalCombined.orderNumber, 
              partNumber: finalCombined.partNumber 
            });
            
            // Focus Performance ID after a short delay
            setTimeout(() => {
              combinedQRParsedRef.current = false;
              perfInputRef.current?.focus();
            }, 100);
          }
          
          pendingOrderValueRef.current = '';
        }, 150);
        
        return; // Don't do normal field navigation while potentially scanning combined QR
      }
    }
    
    // Clear any pending combined QR detection if this doesn't look like a combined code
    if (orderCombinedQRDebounceRef.current) {
      clearTimeout(orderCombinedQRDebounceRef.current);
      orderCombinedQRDebounceRef.current = null;
    }
    pendingOrderValueRef.current = '';
    
    // Normal order number processing - handle scanning state
    if (isRapidTyping && !wasScanning) {
      orderIsScanningRef.current = true;
    } else if (!isRapidTyping) {
      orderIsScanningRef.current = false;
    }
    
    // After Order Number, move to Part Number (Order → Part → Performance flow)
    orderScanTimeoutRef.current = setTimeout(() => {
      orderIsScanningRef.current = false;
      if (normalized && !session.isRunning) {
        partInputRef.current?.focus();
      }
    }, 100);
  };

  const handlePerformanceIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const normalized = normalizeGermanChars(newValue);
    
    const now = Date.now();
    const timeDiff = now - perfLastKeyTimeRef.current;
    perfLastKeyTimeRef.current = now;
    
    if (perfScanTimeoutRef.current) {
      clearTimeout(perfScanTimeoutRef.current);
    }
    
    const wasScanning = perfIsScanningRef.current;
    const isRapidTyping = timeDiff > 0 && timeDiff < 50;
    
    // If order number is empty and this is a scan, auto-fill order number instead
    if (!session.orderNumber && isRapidTyping && normalized) {
      onUpdateSession?.(session.id, { orderNumber: normalized, performanceId: '' });
      perfIsScanningRef.current = false;
      perfScanTimeoutRef.current = setTimeout(() => {
        orderInputRef.current?.focus();
      }, 100);
      return;
    }
    
    if (isRapidTyping && wasScanning) {
      onUpdateSession?.(session.id, { performanceId: normalized });
    } else if (isRapidTyping && !wasScanning) {
      perfIsScanningRef.current = true;
      onUpdateSession?.(session.id, { performanceId: normalized });
    } else {
      perfIsScanningRef.current = false;
      onUpdateSession?.(session.id, { performanceId: normalized });
    }
    
    perfScanTimeoutRef.current = setTimeout(() => {
      perfIsScanningRef.current = false;
      if (normalized && !session.isRunning) {
        startButtonRef.current?.focus();
      }
    }, 100);
  };

  const handlePartNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleOrderNumberFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handlePerformanceIdFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-background via-background to-primary/5 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="glass-effect border-b px-8 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {t.admin.department}: <span className="gradient-text">{department}</span>
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowHistoryDialog(true)}
              data-testid="button-work-history"
            >
              <History className="w-4 h-4 mr-2" />
              {t.tracker.workHistory}
            </Button>
            <Badge variant="outline" className="text-lg px-4 py-2 font-mono font-bold border-2">
              {machineId}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          {/* User Info & Fields */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
            {/* User Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 border-4 sm:border-6 md:border-8 border-background shadow-2xl ring-2 sm:ring-3 md:ring-4 ring-primary/30">
                  <AvatarImage src={session.userImage} alt={session.userName} />
                  <AvatarFallback className="text-3xl sm:text-4xl md:text-5xl bg-gradient-to-br from-primary/20 to-accent/20">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {session.isRunning && (
                  <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-green-500 rounded-full flex items-center justify-center border-3 sm:border-4 border-background shadow-lg animate-pulse">
                    <span className="text-white text-lg sm:text-xl md:text-2xl">●</span>
                  </div>
                )}
                {/* Red warning dot for overtime (> 1 hour) */}
                {session.isRunning && localDuration > 3600 && !overtimeAcknowledged && (
                  <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-red-500 rounded-full flex items-center justify-center border-3 sm:border-4 border-background shadow-lg animate-pulse">
                    <span className="text-white text-lg sm:text-xl md:text-2xl">!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input Fields - Order: Order Number → Part Number → Performance ID */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t.tracker.orderNumber}</label>
                <div className="flex gap-2">
                  <Input
                    ref={orderInputRef}
                    value={session.orderNumber}
                    onChange={handleOrderNumberChange}
                    onFocus={handleOrderNumberFocus}
                    disabled={session.isRunning}
                    placeholder={t.tracker.typeToSearch}
                    className="h-14 text-xl font-bold flex-1"
                    data-testid="input-order-number"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => openDrawer("order")}
                    disabled={session.isRunning}
                    className="h-14 w-14 shrink-0"
                    data-testid="button-dropdown-order"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t.tracker.partNumber}</label>
                <div className="flex gap-2">
                  <Input
                    ref={partInputRef}
                    value={session.partNumber}
                    onChange={handlePartNumberChange}
                    onFocus={handlePartNumberFocus}
                    disabled={session.isRunning}
                    placeholder={t.tracker.typeToSearch}
                    className="h-14 text-xl font-bold flex-1"
                    data-testid="input-part-number"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => openDrawer("part")}
                    disabled={session.isRunning}
                    className="h-14 w-14 shrink-0"
                    data-testid="button-dropdown-part"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">{t.tracker.performanceId}</label>
                <div className="flex gap-2">
                  <Input
                    ref={perfInputRef}
                    value={getPerformanceName(session.performanceId)}
                    onChange={handlePerformanceIdChange}
                    onFocus={handlePerformanceIdFocus}
                    disabled={session.isRunning}
                    placeholder={t.tracker.typeToSearch}
                    className="h-14 text-xl font-bold flex-1"
                    data-testid="input-performance-id"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => openDrawer("performance")}
                    disabled={session.isRunning}
                    className="h-14 w-14 shrink-0"
                    data-testid="button-dropdown-performance"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center gap-2 sm:gap-3 md:gap-4 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 rounded-2xl transition-all ${
                session.isRunning
                  ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30"
                  : "bg-muted/50"
              }`}
            >
              <div className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight" data-testid="text-timer">
                {formatTime(hours)}:{formatTime(minutes)}:{formatTime(secs)}
              </div>
              {!session.isRunning ? (
                <Button
                  ref={startButtonRef}
                  size="icon"
                  onClick={handleStart}
                  disabled={!canStart}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-green-600 hover:bg-green-700 shadow-xl"
                  data-testid="button-start"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleStop}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-xl"
                  data-testid="button-stop"
                >
                  <Square className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                </Button>
              )}
            </div>
          </div>

          {/* Recent Items - Order: Order Number → Part Number → Performance ID */}
          {!session.isRunning && (
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Recent Order Numbers */}
              {recentOrderNumbers.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t.tracker.orderNumber}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {recentOrderNumbers.map((order) => (
                      <Button
                        key={order}
                        variant="outline"
                        className="h-10 sm:h-11 md:h-12 text-sm sm:text-base font-bold border-2 hover:border-primary overflow-hidden"
                        onClick={() => onUpdateSession?.(session.id, { orderNumber: order })}
                        data-testid={`button-recent-order-${order}`}
                      >
                        <span className="truncate w-full">{order}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Part Numbers */}
              {recentPartNumbers.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t.tracker.partNumber}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {recentPartNumbers.map((part) => (
                      <Button
                        key={part}
                        variant="outline"
                        className="h-10 sm:h-11 md:h-12 text-sm sm:text-base font-bold border-2 hover:border-primary overflow-hidden"
                        onClick={() => onUpdateSession?.(session.id, { partNumber: part })}
                        data-testid={`button-recent-part-${part}`}
                      >
                        <span className="truncate w-full">{part}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Performance IDs */}
              {recentPerformanceIds.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t.tracker.performanceId}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {recentPerformanceIds.map((perfId) => {
                      const perfName = getPerformanceName(perfId);
                      return (
                        <Button
                          key={perfId}
                          variant="outline"
                          className="h-10 sm:h-11 md:h-12 text-sm sm:text-base font-bold border-2 hover:border-primary overflow-hidden"
                          onClick={() => onUpdateSession?.(session.id, { performanceId: perfId })}
                          data-testid={`button-recent-perf-${perfId}`}
                        >
                          <span className="truncate w-full">{perfName}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Drawer */}
      <BottomDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          drawerType === "part"
            ? t.tracker.selectPartNumber
            : drawerType === "order"
            ? t.tracker.selectOrderNumber
            : t.tracker.selectPerformanceId
        }
        options={
          drawerType === "part"
            ? partNumbers
            : drawerType === "order"
            ? orderNumbers
            : performanceIds.map(p => p.performanceName)
        }
        onSelect={handleSelectValue}
      />

      {/* Overtime Warning Dialog */}
      <AlertDialog open={showOvertimeNotification} onOpenChange={setShowOvertimeNotification}>
        <AlertDialogContent className="border-red-500 border-2">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 flex items-center gap-2">
              <span className="text-3xl">⚠️</span>
              Timer Over 1 Hour!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              <strong>{session.userName}</strong>'s timer has been running for over 1 hour.
              <br />
              <br />
              Current time: <strong>{formatTime(hours)}:{formatTime(minutes)}:{formatTime(secs)}</strong>
              <br />
              <br />
              Did you forget to stop the timer?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => {
                setOvertimeAcknowledged(true);
                setShowOvertimeNotification(false);
              }} 
              data-testid="button-acknowledge-overtime"
              className="bg-red-500 hover:bg-red-600"
            >
              I'll Continue Working
            </AlertDialogAction>
            <AlertDialogAction 
              onClick={() => {
                setOvertimeAcknowledged(true);
                setShowOvertimeNotification(false);
                handleStop();
              }} 
              data-testid="button-stop-overtime"
            >
              Stop Timer Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Work History Dialog */}
      <WorkHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        userId={session.userId}
        userName={session.userName}
        partNumbers={partNumbers}
        orderNumbers={orderNumbers}
        performanceIds={performanceIds}
      />
    </div>
  );
}
