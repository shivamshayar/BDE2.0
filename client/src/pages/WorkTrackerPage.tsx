import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import CompactSessionsSidebar from "@/components/CompactSessionsSidebar";
import CompactWorkTracker from "@/components/CompactWorkTracker";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserSelectionCard from "@/components/UserSelectionCard";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

interface BdeMachine {
  id: string;
  machineId: string;
  department: string;
  isAdmin?: boolean;
}

export default function WorkTrackerPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [machine, setMachine] = useState<BdeMachine | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");

  // Load machine from session storage
  useEffect(() => {
    const machineData = sessionStorage.getItem("bdeMachine");
    if (!machineData) {
      setLocation("/");
      return;
    }
    setMachine(JSON.parse(machineData));
  }, []);

  // Fetch users
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
    enabled: !!machine,
  });

  // Fetch master data
  const { data: partNumbers = [] } = useQuery<any[]>({
    queryKey: ["/api/master/parts"],
    enabled: !!machine,
  });

  const { data: orderNumbers = [] } = useQuery<any[]>({
    queryKey: ["/api/master/orders"],
    enabled: !!machine,
  });

  const { data: performanceIds = [] } = useQuery<any[]>({
    queryKey: ["/api/master/performance"],
    enabled: !!machine,
  });

  // Fetch recent items
  const { data: recentParts = [] } = useQuery<string[]>({
    queryKey: ["/api/recent", machine?.id, "parts"],
    queryFn: async () => {
      if (!machine) return [];
      const response = await apiRequest("GET", `/api/recent/${machine.id}/parts`);
      return response.json();
    },
    enabled: !!machine,
  });

  const { data: recentOrders = [] } = useQuery<string[]>({
    queryKey: ["/api/recent", machine?.id, "orders"],
    queryFn: async () => {
      if (!machine) return [];
      const response = await apiRequest("GET", `/api/recent/${machine.id}/orders`);
      return response.json();
    },
    enabled: !!machine,
  });

  const { data: recentPerformance = [] } = useQuery<string[]>({
    queryKey: ["/api/recent", machine?.id, "performance"],
    queryFn: async () => {
      if (!machine) return [];
      const response = await apiRequest("GET", `/api/recent/${machine.id}/performance`);
      return response.json();
    },
    enabled: !!machine,
  });

  // Load sessions from backend
  useEffect(() => {
    if (!machine) return;
    
    const loadSessions = async () => {
      try {
        const response = await apiRequest("GET", `/api/sessions/${machine.id}`);
        const data = await response.json();
        
        // Map backend sessions to frontend format
        const mappedSessions = data.map((session: any) => ({
          id: session.id,
          userId: session.userId,
          userName: users.find((u: any) => u.id === session.userId)?.name || "Unknown",
          userImage: users.find((u: any) => u.id === session.userId)?.imageUrl,
          isRunning: session.isRunning,
          duration: session.duration,
          partNumber: session.partNumber || "",
          orderNumber: session.orderNumber || "",
          performanceId: session.performanceId || "",
        }));
        
        setSessions(mappedSessions);
        if (mappedSessions.length > 0 && !activeSessionId) {
          setActiveSessionId(mappedSessions[0].id);
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
      }
    };

    if (users.length > 0) {
      loadSessions();
    }
  }, [machine, users]);

  // Global timer - updates ALL running sessions simultaneously
  useEffect(() => {
    let tickCount = 0;
    
    const interval = setInterval(() => {
      tickCount++;
      const shouldSyncBackend = tickCount % 10 === 0; // Sync to backend every 10 seconds
      
      setSessions((prevSessions) => {
        // Update duration for all running sessions
        const updated = prevSessions.map((session) => {
          if (session.isRunning) {
            const newDuration = session.duration + 1;
            
            // Update backend every 10 seconds to reduce API calls
            if (shouldSyncBackend) {
              updateSessionMutation.mutate({ 
                id: session.id, 
                updates: { duration: newDuration } 
              });
            }
            
            return { ...session, duration: newDuration };
          }
          return session;
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/sessions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/sessions/${id}`, updates);
      return response.json();
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/sessions/${id}`);
      return response.json();
    },
  });

  const createWorkLogMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/work-logs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recent"] });
    },
  });

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const handleUpdateSession = async (sessionId: string, updates: Partial<UserSession>) => {
    // Update local state immediately
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, ...updates } : session
      )
    );

    // Update backend
    try {
      await updateSessionMutation.mutateAsync({ id: sessionId, updates });
    } catch (error) {
      console.error("Error updating session:", error);
      toast({
        title: "Error",
        description: "Failed to update session",
        variant: "destructive",
      });
    }
  };

  const handleStopSession = async (sessionId: string, data: any) => {
    console.log("Work session completed:", data);
    
    // Create work log
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session || !machine) return;

      await createWorkLogMutation.mutateAsync({
        machineId: machine.id,
        userId: session.userId,
        userName: session.userName,
        partNumber: data.partNumber,
        orderNumber: data.orderNumber,
        performanceId: data.performanceId,
        duration: data.duration,
      });

      toast({
        title: "Work Session Completed",
        description: `Duration: ${Math.floor(data.duration / 60)}m ${data.duration % 60}s`,
      });
    } catch (error) {
      console.error("Error saving work log:", error);
      toast({
        title: "Error",
        description: "Failed to save work log",
        variant: "destructive",
      });
    }
  };

  const handleAddSession = async (user: any) => {
    if (!machine) return;

    try {
      const response = await createSessionMutation.mutateAsync({
        machineId: machine.id,
        userId: user.id,
        isRunning: false,
        duration: 0,
        partNumber: "",
        orderNumber: "",
        performanceId: "",
      });

      const newSession: UserSession = {
        id: response.id,
        userId: user.id,
        userName: user.name,
        userImage: user.imageUrl,
        isRunning: false,
        duration: 0,
        partNumber: "",
        orderNumber: "",
        performanceId: "",
      };

      // Add new user to the top of the list
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setShowAddUserDialog(false);

      toast({
        title: "User Added",
        description: `${user.name} has been added to the active sessions.`,
      });
    } catch (error) {
      console.error("Error adding session:", error);
      toast({
        title: "Error",
        description: "Failed to add user session",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSession = async (sessionId: string) => {
    try {
      await deleteSessionMutation.mutateAsync(sessionId);
      
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      // Switch to another session if available
      if (sessions.length > 1) {
        const remainingSessions = sessions.filter((s) => s.id !== sessionId);
        setActiveSessionId(remainingSessions[0].id);
      } else {
        setActiveSessionId("");
      }

      toast({
        title: "User Removed",
        description: "User has been removed from active sessions.",
      });
    } catch (error) {
      console.error("Error removing session:", error);
      toast({
        title: "Error",
        description: "Failed to remove session",
        variant: "destructive",
      });
    }
  };

  // Filter out users who already have active sessions
  const availableUsersToAdd = users.filter(
    (user: any) => !sessions.some((session) => session.userId === user.id)
  );

  if (!machine) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <CompactSessionsSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onAddSession={() => setShowAddUserDialog(true)}
        onRemoveSession={handleRemoveSession}
        onSettings={() => setLocation("/admin")}
        isAdmin={machine.isAdmin}
      />

      <div className="flex flex-col flex-1">
        <AppHeader />
        {activeSession ? (
          <CompactWorkTracker
          session={activeSession}
          department={machine.department}
          machineId={machine.machineId}
          partNumbers={partNumbers.map((p: any) => p.partNumber)}
          orderNumbers={orderNumbers.map((o: any) => o.orderNumber)}
          performanceIds={performanceIds}
          recentPartNumbers={recentParts}
          recentOrderNumbers={recentOrders}
          recentPerformanceIds={recentPerformance}
          onUpdateSession={handleUpdateSession}
          onStopSession={handleStopSession}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
            <div className="text-center space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-5xl">👤</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">No Active Session</h2>
                <p className="text-xl text-muted-foreground">Click the + button in the sidebar to add a user</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Add User to Session</DialogTitle>
            <DialogDescription>
              Select a user to add to the active work sessions
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
            {availableUsersToAdd.length > 0 ? (
              availableUsersToAdd.map((user: any) => (
                <UserSelectionCard
                  key={user.id}
                  id={user.id}
                  name={user.name}
                  imageUrl={user.imageUrl}
                  onClick={() => handleAddSession(user)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">All users are already in active sessions</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
