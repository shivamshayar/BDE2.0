import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Save, X, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface WorkLog {
  id: string;
  userId: string;
  userName: string;
  partNumber: string;
  orderNumber: string;
  performanceId: string;
  duration: number;
  isModified: boolean;
  completedAt: string;
}

interface WorkHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  partNumbers: string[];
  orderNumbers: string[];
  performanceIds: string[];
}

export default function WorkHistoryDialog({
  open,
  onOpenChange,
  userId,
  userName,
  partNumbers,
  orderNumbers,
  performanceIds,
}: WorkHistoryDialogProps) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    partNumber: "",
    orderNumber: "",
    performanceId: "",
  });

  const { data: workLogs = [], isLoading } = useQuery<WorkLog[]>({
    queryKey: ["/api/work-logs/user", userId],
    enabled: open && !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; partNumber: string; orderNumber: string; performanceId: string }) => {
      return await apiRequest("PATCH", `/api/work-logs/${data.id}`, {
        partNumber: data.partNumber,
        orderNumber: data.orderNumber,
        performanceId: data.performanceId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-logs/user", userId] });
      setEditingId(null);
      toast({
        title: "Success",
        description: "Work entry updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update work entry",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (log: WorkLog) => {
    setEditingId(log.id);
    setEditForm({
      partNumber: log.partNumber,
      orderNumber: log.orderNumber,
      performanceId: log.performanceId,
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...editForm,
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      partNumber: "",
      orderNumber: "",
      performanceId: "",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Work History - {userName}</DialogTitle>
          <DialogDescription>
            Last 10 submitted work entries (click edit to modify)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading work history...</div>
            </div>
          ) : workLogs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">No work history found</div>
            </div>
          ) : (
            <div className="space-y-4">
              {workLogs.map((log) => {
                const isEditing = editingId === log.id;

                return (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 space-y-3 hover-elevate"
                    data-testid={`work-log-${log.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(log.completedAt), "PPp")}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatDuration(log.duration)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.isModified && (
                          <Badge variant="secondary" data-testid={`badge-modified-${log.id}`}>
                            Modified
                          </Badge>
                        )}
                        {!isEditing ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(log)}
                            data-testid={`button-edit-${log.id}`}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={handleSave}
                              disabled={updateMutation.isPending}
                              data-testid={`button-save-${log.id}`}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              disabled={updateMutation.isPending}
                              data-testid={`button-cancel-${log.id}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Part Number</Label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <Select
                              value={editForm.partNumber}
                              onValueChange={(value) =>
                                setEditForm({ ...editForm, partNumber: value })
                              }
                            >
                              <SelectTrigger data-testid={`select-part-${log.id}`}>
                                <SelectValue placeholder="Select or type..." />
                              </SelectTrigger>
                              <SelectContent>
                                {partNumbers.map((part) => (
                                  <SelectItem key={part} value={part}>
                                    {part}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={editForm.partNumber}
                              onChange={(e) =>
                                setEditForm({ ...editForm, partNumber: e.target.value })
                              }
                              placeholder="Or type manually..."
                              data-testid={`input-part-${log.id}`}
                            />
                          </div>
                        ) : (
                          <div className="font-mono text-sm p-2 bg-muted rounded" data-testid={`text-part-${log.id}`}>
                            {log.partNumber}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Order Number</Label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <Select
                              value={editForm.orderNumber}
                              onValueChange={(value) =>
                                setEditForm({ ...editForm, orderNumber: value })
                              }
                            >
                              <SelectTrigger data-testid={`select-order-${log.id}`}>
                                <SelectValue placeholder="Select or type..." />
                              </SelectTrigger>
                              <SelectContent>
                                {orderNumbers.map((order) => (
                                  <SelectItem key={order} value={order}>
                                    {order}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={editForm.orderNumber}
                              onChange={(e) =>
                                setEditForm({ ...editForm, orderNumber: e.target.value })
                              }
                              placeholder="Or type manually..."
                              data-testid={`input-order-${log.id}`}
                            />
                          </div>
                        ) : (
                          <div className="font-mono text-sm p-2 bg-muted rounded" data-testid={`text-order-${log.id}`}>
                            {log.orderNumber}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Performance ID</Label>
                        {isEditing ? (
                          <div className="space-y-2">
                            <Select
                              value={editForm.performanceId}
                              onValueChange={(value) =>
                                setEditForm({ ...editForm, performanceId: value })
                              }
                            >
                              <SelectTrigger data-testid={`select-perf-${log.id}`}>
                                <SelectValue placeholder="Select or type..." />
                              </SelectTrigger>
                              <SelectContent>
                                {performanceIds.map((perf) => (
                                  <SelectItem key={perf} value={perf}>
                                    {perf}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={editForm.performanceId}
                              onChange={(e) =>
                                setEditForm({ ...editForm, performanceId: e.target.value })
                              }
                              placeholder="Or type manually..."
                              data-testid={`input-perf-${log.id}`}
                            />
                          </div>
                        ) : (
                          <div className="font-mono text-sm p-2 bg-muted rounded" data-testid={`text-perf-${log.id}`}>
                            {log.performanceId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
