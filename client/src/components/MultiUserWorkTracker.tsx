import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Timer from "./Timer";
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
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-48 h-48">
                    <AvatarImage src={session.userImage} alt={session.userName} />
                    <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold" data-testid="text-user-name">
                      {session.userName}
                    </h2>
                    <Badge variant="secondary" className="mt-2" data-testid="badge-user-role">
                      {session.userRole}
                    </Badge>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Session Status</span>
                    <Badge variant={session.isRunning ? "default" : "secondary"} data-testid="badge-session-status">
                      {session.isRunning ? "Active" : "Idle"}
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
            <Card className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor={`partNumber-${session.id}`}>
                    Part Number <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={session.partNumber}
                    onValueChange={(value) => onUpdateSession?.(session.id, { partNumber: value })}
                    disabled={session.isRunning}
                  >
                    <SelectTrigger
                      id={`partNumber-${session.id}`}
                      className="h-12"
                      data-testid="select-part-number"
                    >
                      <SelectValue placeholder="Select part number" />
                    </SelectTrigger>
                    <SelectContent>
                      {partNumbers.map((pn) => (
                        <SelectItem key={pn} value={pn}>
                          {pn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`orderNumber-${session.id}`}>
                    Order Number <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={session.orderNumber}
                    onValueChange={(value) => onUpdateSession?.(session.id, { orderNumber: value })}
                    disabled={session.isRunning}
                  >
                    <SelectTrigger
                      id={`orderNumber-${session.id}`}
                      className="h-12"
                      data-testid="select-order-number"
                    >
                      <SelectValue placeholder="Select order number" />
                    </SelectTrigger>
                    <SelectContent>
                      {orderNumbers.map((on) => (
                        <SelectItem key={on} value={on}>
                          {on}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`performanceId-${session.id}`}>
                    Performance ID <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={session.performanceId}
                    onValueChange={(value) => onUpdateSession?.(session.id, { performanceId: value })}
                    disabled={session.isRunning}
                  >
                    <SelectTrigger
                      id={`performanceId-${session.id}`}
                      className="h-12"
                      data-testid="select-performance-id"
                    >
                      <SelectValue placeholder="Select performance ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {performanceIds.map((pid) => (
                        <SelectItem key={pid} value={pid}>
                          {pid}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-4">
                  {!session.isRunning ? (
                    <Button
                      className="w-full h-12 bg-green-600 hover:bg-green-700"
                      onClick={handleStart}
                      disabled={!canStart}
                      data-testid="button-start"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Work
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className="w-full h-12"
                      onClick={handleStop}
                      data-testid="button-stop"
                    >
                      <Square className="w-5 h-5 mr-2" />
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
