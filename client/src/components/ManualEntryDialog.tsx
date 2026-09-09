import { useEffect, useRef, useState } from "react";
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
import { ChevronDown, Save } from "lucide-react";
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
  const [perfDropdownOpen, setPerfDropdownOpen] = useState(false);
  const perfFieldRef = useRef<HTMLDivElement>(null);

  const resetForm = () => {
    setOrderNumber("");
    setPartNumber("");
    setPerformanceId("");
    setDay(todayISO());
    setStartTime("");
    setDurationHours(0);
    setDurationMinutes(0);
    setPerfDropdownOpen(false);
  };

  // Resolve typed text to a known performance ID (matches ID or name, case-insensitive)
  const resolvePerformanceId = (value: string): string | null => {
    const search = value.trim().toLowerCase();
    if (!search) return null;
    const byId = performanceIds.find(p => p.performanceId.trim().toLowerCase() === search);
    if (byId) return byId.performanceId;
    const byName = performanceIds.find(p => p.performanceName.trim().toLowerCase() === search);
    return byName ? byName.performanceId : null;
  };

  // Skip validation while the master list is still loading
  const isPerformanceIdValid =
    performanceIds.length === 0 || resolvePerformanceId(performanceId) !== null;
  const showPerformanceIdError = !!performanceId.trim() && !isPerformanceIdValid;

  const selectedPerformanceId = resolvePerformanceId(performanceId);

  // Narrow the list as the user types, but show everything again once the text
  // is an exact match - otherwise picking an entry would filter the list to it
  const perfSearch = performanceId.trim().toLowerCase();
  const performanceIdOptions =
    perfSearch && !selectedPerformanceId
      ? performanceIds.filter(
          p =>
            p.performanceId.toLowerCase().includes(perfSearch) ||
            p.performanceName.toLowerCase().includes(perfSearch),
        )
      : performanceIds;

  useEffect(() => {
    if (!perfDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!perfFieldRef.current?.contains(event.target as Node)) {
        setPerfDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [perfDropdownOpen]);

  const durationSeconds = durationHours * 3600 + durationMinutes * 60;
  const canSave =
    orderNumber.trim() &&
    partNumber.trim() &&
    performanceId.trim() &&
    isPerformanceIdValid &&
    day &&
    startTime &&
    durationSeconds > 0;

  const createMutation = useMutation({
    mutationFn: async () => {
      // completedAt = start time + duration. The start time field is hours/minutes
      // only, so seconds are always 00
      const started = new Date(`${day}T${startTime.slice(0, 5)}:00`);
      const completedAt = new Date(started.getTime() + durationSeconds * 1000);
      const response = await apiRequest("POST", "/api/work-logs", {
        machineId: machineDbId,
        userId,
        userName,
        orderNumber: orderNumber.trim(),
        partNumber: partNumber.trim(),
        performanceId: resolvePerformanceId(performanceId) ?? performanceId.trim(),
        duration: durationSeconds,
        completedAt: completedAt.toISOString(),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-logs/user"] });
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

          <div
            className="space-y-2"
            ref={perfFieldRef}
            onKeyDown={(e) => {
              // Close the dropdown on Escape instead of closing the whole dialog
              if (e.key === "Escape" && perfDropdownOpen) {
                e.preventDefault();
                e.stopPropagation();
                setPerfDropdownOpen(false);
              }
            }}
          >
            <Label htmlFor="manual-perf">{t.tracker.performanceId}</Label>
            <div className="relative">
              <div className="flex gap-2">
                <Input
                  id="manual-perf"
                  value={performanceId}
                  onChange={(e) => {
                    setPerformanceId(e.target.value);
                    setPerfDropdownOpen(true);
                  }}
                  placeholder={t.tracker.typeToSearch}
                  role="combobox"
                  aria-expanded={perfDropdownOpen}
                  aria-invalid={showPerformanceIdError}
                  className={`h-9 flex-1 ${
                    showPerformanceIdError
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  data-testid="input-manual-perf"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setPerfDropdownOpen((open) => !open)}
                  aria-label={t.tracker.selectPerformanceId}
                  aria-expanded={perfDropdownOpen}
                  data-testid="button-manual-perf-dropdown"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      perfDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </div>

              {perfDropdownOpen && (
                <div
                  role="listbox"
                  aria-label={t.tracker.selectPerformanceId}
                  className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-md border bg-popover p-1 shadow-md"
                  data-testid="dropdown-manual-perf"
                >
                  {performanceIdOptions.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      {t.tracker.noResults}
                    </p>
                  ) : (
                    performanceIdOptions.map((p) => (
                      <button
                        key={p.performanceId}
                        type="button"
                        role="option"
                        aria-selected={p.performanceId === selectedPerformanceId}
                        onClick={() => {
                          setPerformanceId(p.performanceId);
                          setPerfDropdownOpen(false);
                        }}
                        className={`flex w-full flex-col items-start rounded-sm px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground ${
                          p.performanceId === selectedPerformanceId ? "bg-accent/50" : ""
                        }`}
                        data-testid={`option-manual-perf-${p.performanceId}`}
                      >
                        <span className="text-sm font-medium">{p.performanceName}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.performanceId}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {showPerformanceIdError && (
              <p
                className="text-xs font-medium text-destructive"
                data-testid="error-manual-perf"
              >
                {t.tracker.invalidPerformanceId}
              </p>
            )}
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
                step="60"
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
