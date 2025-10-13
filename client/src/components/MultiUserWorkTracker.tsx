import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Timer from "./Timer";
import FlexibleInput from "./FlexibleInput";
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
import { Play, Square } from "lucide-react";

interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userImage?: string;
  isRunning: boolean;
  duration: number;
  partNumber: string;
  orderNumber: string;
  performanceId: string;
}

interface MultiUserWorkTrackerProps {
  session: UserSession;
  partNumbers: string[];
  orderNumbers: string[];
  performanceIds: string[];
  onUpdateSession?: (sessionId: string, updates: Partial<UserSession>) => void;
  onStopSession?: (sessionId: string, data: {
    partNumber: string;
    orderNumber: string;
    performanceId: string;
    duration: number;
  }) => void;
}

export default function MultiUserWorkTracker({
  session,
  partNumbers,
  orderNumbers,
  performanceIds,
  onUpdateSession,
  onStopSession,
}: MultiUserWorkTrackerProps) {
  const [showStopDialog, setShowStopDialog] = useState(false);
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
      console.log("Timer started for session:", session.id);
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
    setShowStopDialog(false);
  };

  const handleDurationChange = (newDuration: number) => {
    setLocalDuration(newDuration);
    onUpdateSession?.(session.id, { duration: newDuration });
  };

  const canStart = !session.isRunning && session.partNumber && session.orderNumber && session.performanceId;

  return (
    <div className="flex-1 bg-background p-8 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-xl border-t-4 border-t-primary">
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <Avatar className="w-48 h-48 border-4 border-background shadow-2xl ring-4 ring-primary/20">
                      <AvatarImage src={session.userImage} alt={session.userName} />
                      <AvatarFallback className="text-5xl bg-gradient-to-br from-primary/20 to-accent/20">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {session.isRunning && (
                      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-4 border-background shadow-lg animate-pulse">
                        <span className="text-white text-xl">●</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold" data-testid="text-user-name">
                      {session.userName}
                    </h2>
                    <Badge variant="secondary" className="mt-3 text-base px-4 py-1" data-testid="badge-user-role">
                      {session.userRole}
                    </Badge>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Session Status</span>
                    <Badge 
                      variant={session.isRunning ? "default" : "secondary"} 
                      className="text-sm font-semibold"
                      data-testid="badge-session-status"
                    >
                      {session.isRunning ? "🟢 Active" : "⏸️ Idle"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Work Entry */}
          <div className="lg:col-span-3 space-y-8">
            {/* Timer */}
            <Timer
              isRunning={session.isRunning}
              duration={localDuration}
              onDurationChange={handleDurationChange}
            />

            {/* Data Entry Form */}
            <Card className="p-8 shadow-xl">
              <div className="space-y-6">
                <FlexibleInput
                  id={`partNumber-${session.id}`}
                  label="Part Number"
                  value={session.partNumber}
                  onChange={(value) => onUpdateSession?.(session.id, { partNumber: value })}
                  options={partNumbers}
                  disabled={session.isRunning}
                  required
                />

                <FlexibleInput
                  id={`orderNumber-${session.id}`}
                  label="Order Number"
                  value={session.orderNumber}
                  onChange={(value) => onUpdateSession?.(session.id, { orderNumber: value })}
                  options={orderNumbers}
                  disabled={session.isRunning}
                  required
                />

                <FlexibleInput
                  id={`performanceId-${session.id}`}
                  label="Performance ID"
                  value={session.performanceId}
                  onChange={(value) => onUpdateSession?.(session.id, { performanceId: value })}
                  options={performanceIds}
                  disabled={session.isRunning}
                  required
                />

                <div className="pt-4 space-y-4">
                  {!session.isRunning ? (
                    <Button
                      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                      onClick={handleStart}
                      disabled={!canStart}
                      data-testid="button-start"
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Start Work
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className="w-full h-14 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                      onClick={handleStop}
                      data-testid="button-stop"
                    >
                      <Square className="w-6 h-6 mr-2" />
                      Stop Work
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

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
    </div>
  );
}
