import { useState } from "react";
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
import { Input } from "@/components/ui/input";
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

interface User {
  id: string;
  name: string;
  imageUrl?: string;
}

interface WorkTrackerProps {
  user: User;
  partNumbers: string[];
  orderNumbers: string[];
  performanceIds: string[];
  onSubmit?: (data: {
    partNumber: string;
    orderNumber: string;
    performanceId: string;
    duration: number;
  }) => void;
}

export default function WorkTracker({
  user,
  partNumbers,
  orderNumbers,
  performanceIds,
  onSubmit,
}: WorkTrackerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [partNumber, setPartNumber] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [performanceId, setPerformanceId] = useState("");
  const [showStopDialog, setShowStopDialog] = useState(false);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleStart = () => {
    if (partNumber && orderNumber && performanceId) {
      setIsRunning(true);
      console.log("Timer started");
    }
  };

  const handleStop = () => {
    setShowStopDialog(true);
  };

  const confirmStop = () => {
    setIsRunning(false);
    if (onSubmit) {
      onSubmit({
        partNumber,
        orderNumber,
        performanceId,
        duration,
      });
    }
    console.log("Work session completed:", {
      partNumber,
      orderNumber,
      performanceId,
      duration,
    });
    setShowStopDialog(false);
    setPerformanceId("");
    // Only reset duration - keep part/order/performance for next recording
    setDuration(0);
  };

  const canStart = !isRunning && partNumber && orderNumber && performanceId;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-48 h-48">
                    <AvatarImage src={user.imageUrl} alt={user.name} />
                    <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold" data-testid="text-user-name">
                      {user.name}
                    </h2>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Session Status</span>
                    <Badge variant={isRunning ? "default" : "secondary"} data-testid="badge-session-status">
                      {isRunning ? "Active" : "Idle"}
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
              isRunning={isRunning}
              duration={duration}
              onDurationChange={setDuration}
            />

            {/* Data Entry Form */}
            <Card className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="partNumber">
                    Part Number <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={partNumber}
                    onValueChange={setPartNumber}
                    disabled={isRunning}
                  >
                    <SelectTrigger
                      id="partNumber"
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
                  <Label htmlFor="orderNumber">
                    Order Number <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={orderNumber}
                    onValueChange={setOrderNumber}
                    disabled={isRunning}
                  >
                    <SelectTrigger
                      id="orderNumber"
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
                  <Label htmlFor="performanceId">
                    Performance ID <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={performanceId}
                    onValueChange={setPerformanceId}
                    disabled={isRunning}
                  >
                    <SelectTrigger
                      id="performanceId"
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
                  {!isRunning ? (
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
              This will stop the timer and submit your work data. You cannot undo this action.
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
