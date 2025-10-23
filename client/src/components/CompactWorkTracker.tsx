import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Play, Square, History } from "lucide-react";
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

interface CompactWorkTrackerProps {
  session: UserSession;
  department?: string;
  machineId?: string;
  partNumbers: string[];
  orderNumbers: string[];
  performanceIds: string[];
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
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [localDuration, setLocalDuration] = useState(session.duration);

  useEffect(() => {
    setLocalDuration(session.duration);
  }, [session.duration]);

  const initials = session.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleStart = () => {
    if (session.partNumber && session.orderNumber && session.performanceId) {
      onUpdateSession?.(session.id, { isRunning: true });
    }
  };

  const handleStop = () => {
    setShowStopDialog(true);
  };

  const confirmStop = () => {
    onUpdateSession?.(session.id, { isRunning: false });
    if (onStopSession) {
      onStopSession(session.id, {
        partNumber: session.partNumber,
        orderNumber: session.orderNumber,
        performanceId: session.performanceId,
        duration: localDuration,
      });
    }
    // Reset duration and fields after stopping
    onUpdateSession?.(session.id, {
      duration: 0,
      partNumber: "",
      orderNumber: "",
      performanceId: "",
    });
    setShowStopDialog(false);
  };

  const handleDurationChange = (newDuration: number) => {
    setLocalDuration(newDuration);
    onUpdateSession?.(session.id, { duration: newDuration });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (session.isRunning) {
      interval = setInterval(() => {
        handleDurationChange(localDuration + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session.isRunning, localDuration]);

  const hours = Math.floor(localDuration / 3600);
  const minutes = Math.floor((localDuration % 3600) / 60);
  const secs = localDuration % 60;

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  const canStart = !session.isRunning && session.partNumber && session.orderNumber && session.performanceId;

  return (
    <div className="flex-1 bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <header className="glass-effect border-b px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            Department : <span className="gradient-text">{department}</span>
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowHistoryDialog(true)}
              data-testid="button-work-history"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Badge variant="outline" className="text-lg px-4 py-2 font-mono font-bold border-2">
              {machineId}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* User Info & Fields */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* User Avatar */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="w-48 h-48 border-8 border-background shadow-2xl ring-4 ring-primary/30">
                  <AvatarImage src={session.userImage} alt={session.userName} />
                  <AvatarFallback className="text-5xl bg-gradient-to-br from-primary/20 to-accent/20">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {session.isRunning && (
                  <div className="absolute -bottom-3 -right-3 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center border-4 border-background shadow-lg animate-pulse">
                    <span className="text-white text-2xl">●</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Part Number</label>
                <Input
                  list="part-numbers-list"
                  value={session.partNumber}
                  onChange={(e) => onUpdateSession?.(session.id, { partNumber: e.target.value })}
                  disabled={session.isRunning}
                  placeholder="Type or scan Part Number"
                  className="h-14 text-xl font-bold"
                  data-testid="input-part-number"
                />
                <datalist id="part-numbers-list">
                  {partNumbers.map((pn) => (
                    <option key={pn} value={pn} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Order Number</label>
                <Input
                  list="order-numbers-list"
                  value={session.orderNumber}
                  onChange={(e) => onUpdateSession?.(session.id, { orderNumber: e.target.value })}
                  disabled={session.isRunning}
                  placeholder="Type or scan Order Number"
                  className="h-14 text-xl font-bold"
                  data-testid="input-order-number"
                />
                <datalist id="order-numbers-list">
                  {orderNumbers.map((on) => (
                    <option key={on} value={on} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Performance ID</label>
                <Input
                  list="performance-ids-list"
                  value={session.performanceId}
                  onChange={(e) => onUpdateSession?.(session.id, { performanceId: e.target.value })}
                  disabled={session.isRunning}
                  placeholder="Type or scan Performance ID"
                  className="h-14 text-xl font-bold"
                  data-testid="input-performance-id"
                />
                <datalist id="performance-ids-list">
                  {performanceIds.map((pid) => (
                    <option key={pid} value={pid} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center gap-4 px-8 py-6 rounded-2xl transition-all ${
                session.isRunning
                  ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30"
                  : "bg-muted/50"
              }`}
            >
              <div className="font-mono text-5xl font-bold tracking-tight" data-testid="text-timer">
                {formatTime(hours)}:{formatTime(minutes)}:{formatTime(secs)}
              </div>
              {!session.isRunning ? (
                <Button
                  size="icon"
                  onClick={handleStart}
                  disabled={!canStart}
                  className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 shadow-xl"
                  data-testid="button-start"
                >
                  <Play className="w-8 h-8" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleStop}
                  className="w-16 h-16 rounded-full shadow-xl"
                  data-testid="button-stop"
                >
                  <Square className="w-8 h-8" />
                </Button>
              )}
            </div>
          </div>

          {/* Recent Items */}
          {!session.isRunning && (
            <div className="space-y-6">
              {/* Recent Part Numbers */}
              {recentPartNumbers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Part Numbers</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {recentPartNumbers.map((part) => (
                      <Button
                        key={part}
                        variant="outline"
                        className="h-12 text-base font-bold border-2 hover:border-primary"
                        onClick={() => onUpdateSession?.(session.id, { partNumber: part })}
                        data-testid={`button-recent-part-${part}`}
                      >
                        {part}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Order Numbers */}
              {recentOrderNumbers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Order Numbers</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {recentOrderNumbers.map((order) => (
                      <Button
                        key={order}
                        variant="outline"
                        className="h-12 text-base font-bold border-2 hover:border-primary"
                        onClick={() => onUpdateSession?.(session.id, { orderNumber: order })}
                        data-testid={`button-recent-order-${order}`}
                      >
                        {order}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Performance IDs */}
              {recentPerformanceIds.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Performance IDs</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {recentPerformanceIds.map((perf) => (
                      <Button
                        key={perf}
                        variant="outline"
                        className="h-12 text-base font-bold border-2 hover:border-primary"
                        onClick={() => onUpdateSession?.(session.id, { performanceId: perf })}
                        data-testid={`button-recent-perf-${perf}`}
                      >
                        {perf}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stop Confirmation Dialog */}
      <AlertDialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Work Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop the timer and submit work data for {session.userName}. You cannot undo this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-stop">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStop} data-testid="button-confirm-stop">
              Stop & Submit
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
