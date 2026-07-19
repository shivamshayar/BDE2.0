import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

interface PerformanceIdItem {
  performanceId: string;
  performanceName: string;
}

interface ManualEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineDbId: string;
  userId: string;
  userName: string;
  performanceIds: PerformanceIdItem[];
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ManualEntryDialog({
  open,
  onOpenChange,
  machineDbId,
  userId,
  userName,
  performanceIds,
}: ManualEntryDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [orderNumber, setOrderNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [performanceId, setPerformanceId] = useState("");
  const [day, setDay] = useState(todayISO());
  const [startTime, setStartTime] = useState("");
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);

  const resetForm = () => {
    setOrderNumber("");
    setPartNumber("");
    setPerformanceId("");
    setDay(todayISO());
    setStartTime("");
    setDurationHours(0);
    setDurationMinutes(0);
  };

  const durationSeconds = durationHours * 3600 + durationMinutes * 60;
  const canSave =
    orderNumber.trim() &&
    partNumber.trim() &&
    performanceId.trim() &&
    day &&
    startTime &&
    durationSeconds > 0;

  const createMutation = useMutation({
    mutationFn: async () => {
      // completedAt = start time + duration
      const started = new Date(`${day}T${startTime.length === 5 ? startTime + ":00" : startTime}`);
      const completedAt = new Date(started.getTime() + durationSeconds * 1000);
      const response = await apiRequest("POST", "/api/work-logs", {
        machineId: machineDbId,
        userId,
        userName,
        orderNumber: orderNumber.trim(),
        partNumber: partNumber.trim(),
        performanceId: performanceId.trim(),
        duration: durationSeconds,
        completedAt: completedAt.toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-logs/user", userId, machineDbId] });
      queryClient.invalidateQueries({ queryKey: ["/api/recent"] });
      toast({
        title: t.tracker.addEntryTitle,
        description: `${orderNumber} / ${partNumber}`,
      });
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: t.history.errorLoading,
        description: t.tracker.addEntryTitle,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{t.tracker.addEntryTitle} - {userName}</DialogTitle>
          <DialogDescription>{t.tracker.addEntryDescription}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="manual-order">{t.tracker.orderNumber}</Label>
            <Input
              id="manual-order"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder={t.tracker.typeToSearch}
              className="h-9"
              data-testid="input-manual-order"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-part">{t.tracker.partNumber}</Label>
            <Input
              id="manual-part"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder={t.tracker.typeToSearch}
              className="h-9"
              data-testid="input-manual-part"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-perf">{t.tracker.performanceId}</Label>
            <Input
              id="manual-perf"
              value={performanceId}
              onChange={(e) => setPerformanceId(e.target.value)}
              placeholder={t.tracker.typeToSearch}
              className="h-9"
              data-testid="input-manual-perf"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="manual-day">{t.tracker.day}</Label>
              <Input
                id="manual-day"
                type="date"
                value={day}
                max={todayISO()}
                onChange={(e) => setDay(e.target.value)}
                className="h-9"
                data-testid="input-manual-day"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-start">{t.tracker.startTime}</Label>
              <Input
                id="manual-start"
                type="time"
                step="1"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9"
                data-testid="input-manual-start"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.history.duration}</Label>
            <div className="flex gap-2">
              <Select
                value={String(durationHours)}
                onValueChange={(value) => setDurationHours(parseInt(value))}
              >
                <SelectTrigger className="h-9" data-testid="select-manual-hours">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i} {t.time.hours}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(durationMinutes)}
                onValueChange={(value) => setDurationMinutes(parseInt(value))}
              >
                <SelectTrigger className="h-9" data-testid="select-manual-minutes">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i} {t.time.minutes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
            data-testid="button-manual-cancel"
          >
            {t.cancel}
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!canSave || createMutation.isPending}
            data-testid="button-manual-save"
          >
            <Save className="w-4 h-4 mr-2" />
            {t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
